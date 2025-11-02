import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const secret = process.env.VERCEL_ENV === 'production'
    ? process.env.STRIPE_WEBHOOK_SECRET_LIVE!
    : process.env.STRIPE_WEBHOOK_SECRET_TEST!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const eventId = event.id;
  const processedRef = adminDb.collection('webhook_events').doc(eventId);
  const processed = await processedRef.get();
  if (processed.exists) return NextResponse.json({ received: true, duplicate: true });

  await processedRef.set({
    eventId,
    type: event.type,
    processedAt: Timestamp.now(),
    livemode: event.livemode,
  });

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata.bookingId;
        if (!bookingId) break;

        await adminDb.runTransaction(async (tx) => {
          const ref = adminDb.collection('bookings').doc(bookingId);
          const snap = await tx.get(ref);
          if (!snap.exists) return;
          const booking = snap.data() as any;
          if (booking.status !== 'payment_processing') return;

          tx.update(ref, {
            status: 'confirmed',
            confirmedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            expiresAt: null,
            chargeId: pi.latest_charge,
            receiptUrl: (pi.charges?.data?.[0] as any)?.receipt_url,
          });

          tx.set(adminDb.collection('calendar_blocks').doc(), {
            listingId: booking.listingId,
            bookingId,
            startDate: booking.checkIn,
            endDate: booking.checkOut,
            type: 'booking',
            createdAt: Timestamp.now(),
          });
        });

        // fire-and-forget email
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/booking-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET! },
          body: JSON.stringify({ bookingId }),
        }).catch(() => {});
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
        if (!chargeId) break;

        const qs = await adminDb
          .collection('bookings')
          .where('chargeId', '==', chargeId)
          .limit(1)
          .get();
        if (qs.empty) break;

        const bookingId = qs.docs[0].id;
        await adminDb.collection('bookings').doc(bookingId).update({
          status: 'disputed',
          disputeId: dispute.id,
          disputeReason: dispute.reason,
          disputedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        await adminDb.collection('admin_alerts').add({
          type: 'dispute',
          bookingId,
          disputeId: dispute.id,
          amount: dispute.amount,
          createdAt: Timestamp.now(),
        });
        break;
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer;
        const paymentIntentId = transfer.source_transaction;
        const qs = paymentIntentId
          ? await adminDb.collection('bookings').where('paymentIntentId', '==', paymentIntentId).limit(1).get()
          : null;

        await adminDb.collection('transfers').add({
          transferId: transfer.id,
          amount: transfer.amount,
          currency: transfer.currency,
          destination: transfer.destination,
          bookingId: qs && !qs.empty ? qs.docs[0].id : null,
          paymentIntentId,
          createdAt: Timestamp.now(),
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: true, error: true });
  }
}
