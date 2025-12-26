import { NextResponse } from 'next/server';
import { db } from '@enatbet/firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const paymentsRef = collection(db, 'payments');
    const snapshot = await getDocs(paymentsRef);
    
    let totalRevenue = 0;
    let pendingPayouts = 0;
    let completedPayouts = 0;
    let platformFees = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.type === 'booking_payment' && data.status === 'completed') {
        totalRevenue += data.amount;
      }
      if (data.type === 'host_payout' && data.status === 'pending') {
        pendingPayouts += data.amount;
      }
      if (data.type === 'host_payout' && data.status === 'completed') {
        completedPayouts += data.amount;
      }
      if (data.type === 'commission') {
        platformFees += data.amount;
      }
    });

    return NextResponse.json({
      totalRevenue,
      pendingPayouts,
      completedPayouts,
      platformFees,
    });
  } catch (error) {
    console.error('Payment stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
