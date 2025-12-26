import { NextResponse } from 'next/server';
import { db } from '@enatbet/firebase/firestore';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'all';

  try {
    const bookingsRef = collection(db, 'bookings');
    let q = query(bookingsRef, orderBy('createdAt', 'desc'), limit(100));
    
    if (status !== 'all') {
      q = query(bookingsRef, where('status', '==', status), orderBy('createdAt', 'desc'), limit(100));
    }

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Bookings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
