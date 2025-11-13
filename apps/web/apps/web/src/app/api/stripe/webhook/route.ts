/**
 * Stripe Webhook Handler
 * Production-ready with idempotency, server timestamps, and Connect support
 * CRITICAL: Set up both platform and Connect webhooks in Stripe Dashboard
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Never cache webhook responses

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Handle successful payment
 * Idempotent via Firestore transaction
 */
async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const eventId = event.id;
  const bookingId = paymentIntent.metadata.bookingId;
  
  if (!bookingId) {
    console.error('[WEBHOOK] Missing bookingId in metadata');
    return;
  }

  try {
    await db.runTransaction(async (tx) => {
      // Check if event already processed (idempotency)
      const evtRef = db.collection('stripe_events').doc(eventId);
      const evtSnap = await tx.get(evtRef);
      
      if (evtSnap.exists) {
        console.log(`[WEBHOOK] Event ${eventId} already processed, skipping`);
        return;
      }

      // Log event as processed
      tx.set(evtRef, {
        type: event.type,
        account: event.account ?? null,
        created: event.created,
        processedAt: FieldValue.serverTimestamp(),
      });

      // Update booking status
      tx.update(db.collection('bookings').doc(bookingId), {
        status: 'confirmed',
        paymentIntentId: paymentIntent.id,
        stripeChargeId: paymentIntent.latest_charge ?? null,
        paidAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    console.log(`[WEBHOOK] Booking ${bookingId} confirmed (event: ${eventId})`);
  } catch (error) {
    console.error(`[WEBHOOK] Failed to update booking ${bookingId}:`, error);
    throw error;
  }
}

/**
 * Handle failed payment
 * Idempotent via Firestore transaction
 */
async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const eventId = event.id;
  const bookingId = paymentIntent.metadata.bookingId;
  
  if (!bookingId) {
    console.error('[WEBHOOK] Missing bookingId in metadata');
    return;
  }

  try {
    await db.runTransaction(async (tx) => {
      // Check if event already processed (idempotency)
      const evtRef = db.collection('stripe_events').doc(eventId);
      const evtSnap = await tx.get(evtRef);
      
      if (evtSnap.exists) {
        console.log(`[WEBHOOK] Event ${eventId} already processed, skipping`);
        return;
      }

      // Log event as processed
      tx.set(evtRef, {
        type: event.type,
        account: event.account ?? null,
        created: event.created,
        processedAt: FieldValue.serverTimestamp(),
      });

      // Update booking status
      tx.update(db.collection('bookings').doc(bookingId), {
        status: 'payment_failed',
        paymentIntentId: paymentIntent.id,
        paymentError: paymentIntent.last_payment_error?.message ?? 'Payment failed',
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    console.log(`[WEBHOOK] Booking ${bookingId} payment failed (event: ${eventId})`);
  } catch (error) {
    console.error(`[WEBHOOK] Failed to update booking ${bookingId}:`, error);
    throw error;
  }
}

/**
 * Handle charge refund
 * Idempotent via Firestore transaction
 */
async function handleChargeRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;
  const eventId = event.id;
  const bookingId = charge.metadata?.bookingId;
  
  if (!bookingId) {
    console.error('[WEBHOOK] Missing bookingId in charge metadata');
    return;
  }

  try {
    await db.runTransaction(async (tx) => {
      // Check if event already processed (idempotency)
      const evtRef = db.collection('stripe_events').doc(eventId);
      const evtSnap = await tx.get(evtRef);
      
      if (evtSnap.exists) {
        console.log(`[WEBHOOK] Event ${eventId} already processed, skipping`);
        return;
      }

      // Log event as processed
      tx.set(evtRef, {
        type: event.type,
        account: event.account ?? null,
        created: event.created,
        processedAt: FieldValue.serverTimestamp(),
      });

      // Update booking status
      tx.update(db.collection('bookings').doc(bookingId), {
        status: 'refunded',
        refundedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    console.log(`[WEBHOOK] Booking ${bookingId} refunded (event: ${eventId})`);
  } catch (error) {
    console.error(`[WEBHOOK] Failed to update booking ${bookingId}:`, error);
    throw error;
  }
}

/**
 * Handle canceled payment intent
 */
async function handlePaymentIntentCanceled(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const eventId = event.id;
  const bookingId = paymentIntent.metadata.bookingId;
  
  if (!bookingId) {
    console.log(`[WEBHOOK] PaymentIntent canceled without bookingId: ${paymentIntent.id}`);
    return;
  }

  try {
    await db.runTransaction(async (tx) => {
      // Check if event already processed (idempotency)
      const evtRef = db.collection('stripe_events').doc(eventId);
      const evtSnap = await tx.get(evtRef);
      
      if (evtSnap.exists) {
        console.log(`[WEBHOOK] Event ${eventId} already processed, skipping`);
        return;
      }

      // Log event as processed
      tx.set(evtRef, {
        type: event.type,
        account: event.account ?? null,
        created: event.created,
        processedAt: FieldValue.serverTimestamp(),
      });

      // Update booking status
      tx.update(db.collection('bookings').doc(bookingId), {
        status: 'cancelled',
        paymentIntentId: paymentIntent.id,
        cancelledAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    console.log(`[WEBHOOK] Booking ${bookingId} canceled (event: ${eventId})`);
  } catch (error) {
    console.error(`[WEBHOOK] Failed to update booking ${bookingId}:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('[WEBHOOK] Signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Log event details (including connected account if present)
    console.log(
      `[WEBHOOK] Received event: ${event.type} ` +
      `(id: ${event.id}, account: ${event.account ?? 'platform'})`
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event);
        break;

      // Connect events (from "Events on connected accounts" webhook)
      case 'account.updated':
        const account = event.data.object as Stripe.Account;
        console.log(
          `[WEBHOOK] Connected account updated: ${account.id} ` +
          `(charges_enabled: ${account.charges_enabled}, ` +
          `payouts_enabled: ${account.payouts_enabled})`
        );
        break;

      case 'account.application.deauthorized':
        const deauthAccount = event.data.object as Stripe.Account;
        console.log(`[WEBHOOK] Account deauthorized: ${deauthAccount.id}`);
        // TODO: Mark host as disconnected in your database
        break;

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('[WEBHOOK] Error processing webhook:', error);
    
    // Return 500 so Stripe retries
    return NextResponse.json(
      { error: error?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
