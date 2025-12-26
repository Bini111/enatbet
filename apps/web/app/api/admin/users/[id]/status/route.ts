import { NextResponse } from 'next/server';
import { db } from '@enatbet/firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const userRef = doc(db, 'users', params.id);
    
    await updateDoc(userRef, {
      status,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User status update error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
