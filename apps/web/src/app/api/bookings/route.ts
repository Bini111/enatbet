import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getUserBookings, getHostBookings } from '@enatbet/firebase';
import { calculatePriceBreakdown } from '@enatbet/shared';
import { adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'guest' or 'host'

    let bookings;
    if (type === 'host') {
      bookings = await getHostBookings(userId);
    } else {
      bookings = await getUserBookings(userId);
    }

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { listingId, checkIn, checkOut, guests } = body;

    // Validate required fields
    if (!listingId || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate pricing (this should ideally be done server-side with listing data)
    // For now, we'll require the client to pass pricing
    const pricing = body.pricing;
    if (!pricing) {
      return NextResponse.json(
        { error: 'Pricing information required' },
        { status: 400 }
      );
    }

    const bookingData = {
      listingId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests,
    };

    const bookingId = await createBooking(userId, bookingData, pricing);

    return NextResponse.json(
      { bookingId, message: 'Booking created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
