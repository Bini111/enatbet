import { NextResponse } from 'next/server';
import { db } from '@enatbet/firebase/firestore';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const settingsRef = doc(db, 'settings', 'platform');
    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      return NextResponse.json({
        settings: {
          commissionRate: 15,
          currency: 'USD',
          defaultLanguage: 'en',
          bookingCancellationHours: 48,
          autoApproveListings: false,
          requireHostVerification: true,
          enableGuestReviews: true,
          enableHostReviews: true,
          minBookingDays: 1,
          maxBookingDays: 90,
        }
      });
    }

    return NextResponse.json({ settings: settingsDoc.data() });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const settings = await request.json();
    const settingsRef = doc(db, 'settings', 'platform');
    
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
