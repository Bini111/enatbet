import { NextResponse } from 'next/server';
import { db } from '@enatbet/firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listingRef = doc(db, 'listings', params.id);
    
    await updateDoc(listingRef, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Listing rejection error:', error);
    return NextResponse.json({ error: 'Failed to reject listing' }, { status: 500 });
  }
}
