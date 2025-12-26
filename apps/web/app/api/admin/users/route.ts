import { NextResponse } from 'next/server';
import { db } from '@enatbet/firebase/firestore';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'all';

  try {
    const usersRef = collection(db, 'users');
    let q = query(usersRef, orderBy('createdAt', 'desc'), limit(100));
    
    if (filter !== 'all') {
      q = query(usersRef, where('role', '==', filter), orderBy('createdAt', 'desc'), limit(100));
    }

    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
