/**
 * Create Payment Intent API Route
 * Production-hardened payment creation with comprehensive validation
 * 
 * SECURITY:
 * - Firebase auth verification
 * - Zod schema validation
 * - Server-side host account lookup (NOT client-supplied)
 * - Deterministic idempotency
 * - Safe Firestore operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent, createCustomer } from '@/lib/stripe';
import { validateStripeCharge } from '@/lib/stripe-validation';
import { getBusinessConfig } from '@/lib/config/business';
import { calculatePriceBreakdown, convertToStripeAmount } from '@enatbet/shared';
import { auth, db } from '@/lib/firebase-admin';
import type { Money } from '@enatbet/shared';
import { createHash } from 'crypto';
import { z } from 'zod';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Request schema with strict validation
const moneySchema = z.object({
  amount: z.number().finite().positive(),
  currency: z.string().length(3).toUpperCase().default('USD'),
});

const requestSchema = z.object({
  bookingId: z.string().min(1).max(128),
  listingId: z.string().min(1).max(128),
  pricePerNight: moneySchema,
  nights: z.number().int().positive().max(365), // Max 1 year
  cleaningFee: moneySchema.optional(),
}).strict();

/**
 * Generate deterministic idempotency key
 * Same bookingId always produces same key for safe retries
 */
function generateIdempotencyKey(bookingId: string): string {
  const hash = createHash('sha256').update(`payment:${bookingId}`).digest('hex');
  return `payment-${hash.substring(0, 32)}`;
}

/**
 * Lookup host's Stripe Connect account from listing
 * CRITICAL: Never trust client-supplied account IDs
 */
async function getHostStripeAccount(listingId: string): Promise<string | undefined> {
  try {
    const listingDoc = await db.collection('listings').doc(listingId).get();
    
    if (!listingDoc.exists) {
      throw new Error('Listing not found');
    }
    
    const listing = listingDoc.data();
    const hostId = listing?.hostId;
    
    if (!hostId) {
      throw new Error('Listing has no host');
    }
    
    // Get host's Stripe account
    const hostDoc = await db.collection('users').doc(hostId).get();
    const hostData = hostDoc.data();
    
    return hostData?.stripeConnectAccountId; // May be undefined if not onboarded
  } catch (error) {
    console.error('[CREATE_PAYMENT] Host lookup failed:', error);
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  try {
    // ===== AUTHENTICATION =====
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.slice(7); // Remove 'Bearer '
    let decodedToken;
    
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error('[CREATE_PAYMENT] Token verification failed');
      return NextResponse.json(
        { error: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;
    const userName = decodedToken.name;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required for payment processing' },
        { status: 400 }
      );
    }

    // ===== INPUT VALIDATION =====
    const body = await request.json();
    const parseResult = requestSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: parseResult.error.format()
        },
        { status: 400 }
      );
    }

    const {
      bookingId,
      listingId,
      pricePerNight,
      nights,
      cleaningFee,
    } = parseResult.data;

    // ===== BUSINESS LOGIC =====
    const config = getBusinessConfig();
    
    // Calculate pricing
    const pricePerNightMoney: Money = {
      amount: pricePerNight.amount,
      currency: pricePerNight.currency,
    };
    
    const cleaningFeeMoney: Money | undefined = cleaningFee ? {
      amount: cleaningFee.amount,
      currency: cleaningFee.currency,
    } : undefined;
    
    const pricing = calculatePriceBreakdown(
      pricePerNightMoney,
      nights,
      config.platformFeeRate,
      config.taxRate,
      cleaningFeeMoney
    );

    // Validate against Stripe minimums
    const validation = validateStripeCharge(
      pricing.total.amount,
      pricing.total.currency as any
    );

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // ===== STRIPE CUSTOMER =====
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    
    let stripeCustomerId = userData?.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await createCustomer(userEmail, userName);
      stripeCustomerId = customer.id;
      
      // Safe upsert (won't fail if doc doesn't exist)
      await userRef.set(
        {
          stripeCustomerId: customer.id,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    }

    // ===== STRIPE CONNECT (SERVER-SIDE LOOKUP) =====
    const hostStripeAccountId = await getHostStripeAccount(listingId);
    const platformFeeAmount = hostStripeAccountId 
      ? convertToStripeAmount(pricing.serviceFee)
      : undefined;

    // ===== IDEMPOTENCY =====
    const clientIdempotencyKey = request.headers.get('Idempotency-Key');
    const idempotencyKey = clientIdempotencyKey || generateIdempotencyKey(bookingId);

    // ===== CREATE PAYMENT INTENT =====
    const paymentIntent = await createPaymentIntent({
      amount: convertToStripeAmount(pricing.total),
      currency: pricing.total.currency.toLowerCase(),
      customerId: stripeCustomerId,
      connectedAccountId: hostStripeAccountId,
      applicationFeeAmount: platformFeeAmount,
      metadata: {
        bookingId,
        listingId,
        nights: String(nights),
        guestEmail: userEmail,
        userId,
      },
      idempotencyKey,
    });

    // ===== RESPONSE =====
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: stripeCustomerId,
      amount: pricing.total.amount,
      currency: pricing.total.currency,
      breakdown: {
        basePrice: pricing.basePrice,
        cleaningFee: pricing.cleaningFee,
        serviceFee: pricing.serviceFee,
        tax: pricing.tax,
        total: pricing.total,
      },
    });

  } catch (error: any) {
    console.error('[CREATE_PAYMENT] Error:', {
      message: error.message,
      type: error.type,
    });

    // Categorize Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      const statusCode = error.statusCode || 500;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    // Generic error (don't leak internals)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
