import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'month';

  try {
    const data = {
      userGrowth: [
        { month: 'Jan', users: 120 },
        { month: 'Feb', users: 150 },
        { month: 'Mar', users: 180 },
        { month: 'Apr', users: 220 },
        { month: 'May', users: 280 },
        { month: 'Jun', users: 340 },
      ],
      bookingTrends: [
        { month: 'Jan', bookings: 45 },
        { month: 'Feb', bookings: 52 },
        { month: 'Mar', bookings: 68 },
        { month: 'Apr', bookings: 85 },
        { month: 'May', bookings: 102 },
        { month: 'Jun', bookings: 125 },
      ],
      revenueData: [
        { month: 'Jan', revenue: 12500 },
        { month: 'Feb', revenue: 15200 },
        { month: 'Mar', revenue: 18900 },
        { month: 'Apr', revenue: 24300 },
        { month: 'May', revenue: 29800 },
        { month: 'Jun', revenue: 36500 },
      ],
      topLocations: [
        { city: 'Addis Ababa', bookings: 156 },
        { city: 'Bahir Dar', bookings: 89 },
        { city: 'Gondar', bookings: 67 },
        { city: 'Hawassa', bookings: 54 },
        { city: 'Dire Dawa', bookings: 43 },
      ],
      propertyTypes: [
        { type: 'apartment', count: 145 },
        { type: 'villa', count: 98 },
        { type: 'house', count: 76 },
        { type: 'condo', count: 52 },
      ],
      occupancyRate: 68,
      avgBookingValue: 245,
      repeatGuestRate: 32,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
