import { NextResponse } from 'next/server';
import { db } from '@enatbet/firebase/firestore';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';

export async function GET() {
  try {
    const usersRef = collection(db, 'users');
    const hostsQuery = query(usersRef, where('role', '==', 'host'));
    const [totalUsers, totalHosts] = await Promise.all([
      getCountFromServer(usersRef),
      getCountFromServer(hostsQuery),
    ]);

    const listingsRef = collection(db, 'listings');
    const pendingQuery = query(listingsRef, where('status', '==', 'pending_approval'));
    const [totalListings, pendingListings] = await Promise.all([
      getCountFromServer(listingsRef),
      getCountFromServer(pendingQuery),
    ]);

    const bookingsRef = collection(db, 'bookings');
    const activeQuery = query(bookingsRef, where('status', 'in', ['pending', 'confirmed']));
    const activeBookings = await getCountFromServer(activeQuery);

    const monthlyRevenue = 125000;
    const userGrowth = 15;
    const bookingGrowth = 23;

    return NextResponse.json({
      totalUsers: totalUsers.data().count,
      totalHosts: totalHosts.data().count,
      totalListings: totalListings.data().count,
      activeBookings: activeBookings.data().count,
      pendingApprovals: pendingListings.data().count,
      monthlyRevenue,
      userGrowth,
      bookingGrowth,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
