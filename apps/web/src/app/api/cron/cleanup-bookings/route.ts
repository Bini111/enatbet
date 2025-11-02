import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cronHeader = req.headers.get('x-vercel-cron');
  const authHeader = req.headers.get('authorization');

  const isVercelCron = cronHeader === '1';
  const isManualTrigger = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  if (!isVercelCron && !isManualTrigger) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Timestamp.now();
  let cleanedCount = 0;

  try {
    // 1) Expire pending
    const expiredPending = await adminDb
      .collection('bookings')
      .where('status', '==', 'pending_payment')
      .where('expiresAt', '<=', now)
      .limit(100)
      .get();

    const batch1 = adminDb.batch();
    expiredPending.forEach((doc) => {
      batch1.update(doc.ref, {
        status: 'cancelled_by_system',
        cancelledAt: now,
        cancellationReason: 'Payment timeout',
        updatedAt: now,
      });
      cleanedCount++;
    });
    await batch1.commit();

    // 2) Stale processing
    const staleProcessing = await adminDb
      .collection('bookings')
      .where('status', '==', 'payment_processing')
      .where('createdAt', '<=', Timestamp.fromMillis(now.toMillis() - 2 * 60 * 60 * 1000))
      .limit(50)
      .get();

    const batch2 = adminDb.batch();
    staleProcessing.forEach((doc) => {
      batch2.update(doc.ref, {
        status: 'cancelled_by_system',
        cancelledAt: now,
        cancellationReason: 'Payment processing timeout',
        updatedAt: now,
      });
      cleanedCount++;
    });
    await batch2.commit();

    // 3) Complete finished stays
    const yesterday = Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000);
    const completed = await adminDb
      .collection('bookings')
      .where('status', '==', 'confirmed')
      .where('checkOut', '<=', yesterday)
      .limit(100)
      .get();

    const batch3 = adminDb.batch();
    completed.forEach((doc) => {
      batch3.update(doc.ref, {
        status: 'completed',
        completedAt: now,
        updatedAt: now,
      });
      cleanedCount++;
    });
    await batch3.commit();

    // 4) Remove old calendar blocks
    const oldBlocks = await adminDb
      .collection('calendar_blocks')
      .where('endDate', '<=', yesterday)
      .limit(100)
      .get();

    const batch4 = adminDb.batch();
    oldBlocks.forEach((doc) => {
      batch4.delete(doc.ref);
      cleanedCount++;
    });
    await batch4.commit();

    return NextResponse.json({ success: true, cleanedCount, timestamp: now.toDate().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
