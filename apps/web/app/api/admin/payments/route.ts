import { NextResponse } from 'next/server';
import { db } from '@enatbet/firebase/firestore';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  try {
    const paymentsRef = collection(db, 'payments');
    let q = query(paymentsRef, orderBy('createdAt', 'desc'), limit(100));
    
    if (type !== 'all') {
      q = query(paymentsRef, where('type', '==', type), orderBy('createdAt', 'desc'), limit(100));
    }

    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Payments fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
