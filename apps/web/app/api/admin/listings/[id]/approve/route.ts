import { NextResponse } from 'next/server';
import { db } from '@enatbet/firebase/firestore';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listingRef = doc(db, 'listings', params.id);
    const listingDoc = await getDoc(listingRef);
    
    if (!listingDoc.exists()) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    await updateDoc(listingRef, {
      status: 'active',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Listing approval error:', error);
    return NextResponse.json({ error: 'Failed to approve listing' }, { status: 500 });
  }
}
