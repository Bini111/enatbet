import { NextResponse } from 'next/server';
import { db } from '@enatbet/firebase/firestore';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'all';

  try {
    const listingsRef = collection(db, 'listings');
    let q = query(listingsRef, orderBy('createdAt', 'desc'), limit(100));
    
    if (status !== 'all') {
      q = query(listingsRef, where('status', '==', status), orderBy('createdAt', 'desc'), limit(100));
    }

    const snapshot = await getDocs(q);
    const listings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Listings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}
