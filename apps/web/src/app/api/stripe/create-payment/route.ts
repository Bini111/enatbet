import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import crypto from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { RateLimiter, MoneyUtils, SUPPORTED_CURRENCIES } from '@enatbet/shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20',
  typescript: true,
});

const createPaymentSchema = z.object({
  listingId: z.string(), // Firestore doc IDs aren't guaranteed UUIDs
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  guests: z.number().int().min(1).max(16)
});

const rateLimiter = new RateLimiter({ windowMs: 60_000, max: 5 });

export async function POST(req: NextRequest) {
  const correlationId = crypto.createHash('sha256')
    .update(`${Date.now()}-${Math.random()}`)
    .digest('hex')
    .slice(0, 16);

  try {
    // Auth
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const guestId = decoded.uid;

    // Rate limit
    const ok = await rateLimiter.check(`payment:${guestId}`);
    if (!ok) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });

    // Validate
    const body = await req.json();
    const { listingId, checkIn, checkOut, guests } = createPaymentSchema.parse(body);

    // Convert to Timestamps before querying
    const checkInTs = Timestamp.fromDate(new Date(checkIn));
    const checkOutTs = Timestamp.fromDate(new Date(checkOut));

    // Pre-generate booking ID
    const bookingId = adminDb.collection('bookings').doc().id;

    // Transaction: availability, host capability, pricing, booking create
    const result = await adminDb.runTransaction(async (tx) => {
      const listingRef = adminDb.collection('listings').doc(listingId);
      const listingSnap = await tx.get(listingRef);
      if (!listingSnap.exists) throw new Error('Listing not found');
      const listing = listingSnap.data() as any;

      // Host doc
      const hostRef = adminDb.collection('users').doc(listing.hostId);
      const hostSnap = await tx.get(hostRef);
      if (!hostSnap.exists) throw new Error('Host not found');
      const hostData = hostSnap.data() as any;
      if (!hostData.stripeAccountId || !hostData.stripeChargesEnabled || !hostData.stripePayoutsEnabled) {
        throw new Error('Host account not active');
      }

      // Overlap query (composite index required)
      const overlapQuery = adminDb
        .collection('bookings')
        .where('listingId', '==', listingId)
        .where('status', 'in', ['confirmed', 'pending_payment', 'payment_processing'])
        .where('checkIn', '<', checkOutTs)
        .where('checkOut', '>', checkInTs);

      const overlapSnap = await tx.get(overlapQuery);
      if (!overlapSnap.empty) throw new Error('Dates not available');

      // Nights
      const nights = Math.ceil((checkOutTs.toMillis() - checkInTs.toMillis()) / 86_400_000);
      if (nights < 1) throw new Error('Invalid date range');

      // Currency and pricing
      const currency = SUPPORTED_CURRENCIES[listing.currency];
      if (!currency) throw new Error('Unsupported currency for listing');
      const pricePerNightMinor = MoneyUtils.toMinorUnits(listing.pricePerNight, currency);
      const subtotalMinor = pricePerNightMinor * nights;
      const serviceFeeMinor = Math.round(subtotalMinor * 0.15);
      const totalMinor = subtotalMinor + serviceFeeMinor;
      const hostPayoutMinor = subtotalMinor - serviceFeeMinor;

      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(now.toMillis() + 30 * 60 * 1000);

      const bookingData = {
        id: bookingId,
        listingId,
        hostId: listing.hostId,
        guestId,
        status: 'pending_payment',
        checkIn: checkInTs,
        checkOut: checkOutTs,
        guests,
        pricing: {
          nights,
          pricePerNight: { amount: pricePerNightMinor, currency },
          subtotal: { amount: subtotalMinor, currency },
          serviceFee: { amount: serviceFeeMinor, currency },
          hostPayout: { amount: hostPayoutMinor, currency },
          total: { amount: totalMinor, currency },
          refundable: listing.cancellationPolicy === 'flexible',
          cancellationDeadline: listing.cancellationPolicy === 'flexible'
            ? Timestamp.fromMillis(checkInTs.toMillis() - 24 * 60 * 60 * 1000)
            : null,
        },
        correlationId,
        createdAt: now,
        updatedAt: now,
        expiresAt,
      };

      tx.set(adminDb.collection('bookings').doc(bookingId), bookingData);

      return { booking: bookingData, hostStripeAccount: hostData.stripeAccountId };
    });

    const { booking, hostStripeAccount } = result;

    // Deterministic idempotency key
    const idempotencyKey = crypto.createHash('sha256')
      .update(`${booking.id}-${booking.guestId}-${booking.listingId}-${booking.checkIn.toMillis()}`)
      .digest('hex');

    // PaymentIntent
    const pi = await stripe.paymentIntents.create({
      amount: booking.pricing.total.amount,
      currency: booking.pricing.total.currency.code.toLowerCase(),
      payment_method_types: ['card'],
      application_fee_amount: booking.pricing.serviceFee.amount,
      transfer_data: { destination: hostStripeAccount },
      metadata: {
        bookingId,
        listingId,
        guestId,
        hostId: booking.hostId,
        correlationId,
        environment: process.env.VERCEL_ENV || 'development',
      },
      description: `Booking ${bookingId}`,
      statement_descriptor: 'ENATBET',
      receipt_email: decoded.email || undefined,
    }, { idempotencyKey });

    await adminDb.collection('bookings').doc(bookingId).update({
      paymentIntentId: pi.id,
      status: 'payment_processing',
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      bookingId,
      clientSecret: pi.client_secret,
      amount: booking.pricing.total, // minor units + currency object
      expiresAt: booking.expiresAt.toMillis(),
    });
  } catch (err: any) {
    const msg = err?.message || 'Payment processing failed';
    const status =
      msg === 'Dates not available' ? 409 :
      msg === 'Host account not active' ? 400 :
      500;
    return NextResponse.json({ error: msg }, { status });
  }
}
