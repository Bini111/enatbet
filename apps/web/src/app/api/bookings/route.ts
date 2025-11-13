import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getUserBookings, checkAvailability } from '@enatebet/firebase';
import { MoneyUtils, calculateNights } from '@enatebet/shared';
import type { BookingCreate, SupportedCurrency } from '@enatebet/shared';

/**
 * POST /api/bookings - Create new booking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, bookingData } = body;

    if (!guestId) {
      return NextResponse.json(
        { success: false, error: 'Guest ID is required' },
        { status: 400 }
      );
    }

    if (!bookingData) {
      return NextResponse.json(
        { success: false, error: 'Booking data is required' },
        { status: 400 }
      );
    }

    // Validate dates
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { success: false, error: 'Check-out must be after check-in' },
        { status: 400 }
      );
    }

    // Check availability
    const isAvailable = await checkAvailability(
      bookingData.listingId,
      checkIn,
      checkOut
    );

    if (!isAvailable) {
      return NextResponse.json(
        { success: false, error: 'Dates are not available' },
        { status: 409 }
      );
    }

    // Calculate pricing (would typically get listing details here)
    const nights = calculateNights(checkIn, checkOut);
    const basePrice = bookingData.basePrice || 100; // Should come from listing
    const cleaningFee = bookingData.cleaningFee || 25;
    const currency: SupportedCurrency = 'USD';

    const pricing = MoneyUtils.calculateBookingTotal({
      basePrice,
      nights,
      cleaningFee,
      currency,
    });

    // Create booking
    const bookingId = await createBooking(guestId, {
      listingId: bookingData.listingId,
      checkIn,
      checkOut,
      guests: bookingData.guests,
      specialRequests: bookingData.specialRequests,
    }, pricing);

    return NextResponse.json(
      { success: true, data: { id: bookingId, pricing } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings - Get user bookings
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const bookings = await getUserBookings(userId);
    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
