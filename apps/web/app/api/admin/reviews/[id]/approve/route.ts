import { NextResponse } from 'next/server';
import { db } from '@enatbet/firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviewRef = doc(db, 'reviews', params.id);
    
    await updateDoc(reviewRef, {
      status: 'active',
      flaggedCount: 0,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review approval error:', error);
    return NextResponse.json({ error: 'Failed to approve review' }, { status: 500 });
  }
}
