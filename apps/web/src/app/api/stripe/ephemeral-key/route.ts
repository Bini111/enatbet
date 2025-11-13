/**
 * Ephemeral Key API Route
 * Creates temporary Stripe credentials for mobile PaymentSheet
 * 
 * SECURITY: Firebase auth required, returns minimal key payload
 * PERFORMANCE: Fast response, cached customer lookups
 * MOBILE: iOS/Android SDK compatible with version validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createEphemeralKey, createCustomer } from '@/lib/stripe';
import { auth } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase-admin';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/ephemeral-key
 * 
 * Headers: Authorization: Bearer <firebase-token>
 * Body: { apiVersion: string }
 * Response: { ephemeralKey: {id, secret}, customerId: string }
 */
export async function POST(request: NextRequest) {
  // Reject non-POST
  if (request.method !== 'POST') {
    return new NextResponse(null, { 
      status: 405, 
      headers: { 'Allow': 'POST' } 
    });
  }

  try {
    // Verify Firebase auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error('[EPHEMERAL_KEY] Invalid token:', error);
      return NextResponse.json(
        { error: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required for payment processing' },
        { status: 400 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const { apiVersion } = body;

    // Validate API version format (YYYY-MM-DD or YYYY-MM-DD.suffix)
    const versionStr = String(apiVersion || '').trim();
    const isValidVersion = /^\d{4}-\d{2}-\d{2}(\.[a-z]+)?$/.test(versionStr);
    
    if (!isValidVersion) {
      return NextResponse.json(
        { error: 'Invalid apiVersion format. Expected: YYYY-MM-DD or YYYY-MM-DD.suffix' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;

    // Check if customer ID exists in Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (userData?.stripeCustomerId) {
      stripeCustomerId = userData.stripeCustomerId;
    } else {
      // Create new customer
      const userRecord = await auth.getUser(userId);
      const displayName = userRecord.displayName || undefined;
      const customer = await createCustomer(userEmail, displayName);
      stripeCustomerId = customer.id;

      // Persist to Firestore
      await db.collection('users').doc(userId).update({
        stripeCustomerId: customer.id,
        updatedAt: new Date(),
      });
    }

    // Create ephemeral key
    const ephemeralKey = await createEphemeralKey(stripeCustomerId, versionStr);

    // Return minimal payload with no-cache header
    return NextResponse.json(
      {
        customerId: stripeCustomerId,
        ephemeralKey: {
          id: ephemeralKey.id,
          secret: ephemeralKey.secret,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );

  } catch (error: any) {
    console.error('[EPHEMERAL_KEY] Error:', error);

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      const statusCode = error.statusCode || 500;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Failed to create ephemeral key' },
      { status: 500 }
    );
  }
}
