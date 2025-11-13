import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, cancelBooking } from '@enatebet/firebase';

/**
 * GET /api/bookings/[id] - Get booking by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await getBookingById(params.id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/bookings/[id] - Cancel booking
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, reason, cancelledBy } = body;

    if (action !== 'cancel') {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Cancellation reason is required' },
        { status: 400 }
      );
    }

    await cancelBooking(params.id, reason, cancelledBy || 'guest');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
