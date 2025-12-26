import { NextResponse } from 'next/server';
import { db } from '@enatbet/firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviewRef = doc(db, 'reviews', params.id);
    
    await updateDoc(reviewRef, {
      status: 'removed',
      removedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review deletion error:', error);
    return NextResponse.json({ error: 'Failed to remove review' }, { status: 500 });
  }
}
