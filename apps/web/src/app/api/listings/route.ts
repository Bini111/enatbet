import { NextRequest, NextResponse } from 'next/server';
import { getAllListings, createListing, searchListings } from '@enatbet/firebase';
import { getAuth } from 'firebase-admin/auth';
import { adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// GET /api/listings - Search/filter listings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const hostId = searchParams.get('hostId');
    const maxResults = parseInt(searchParams.get('limit') || '50');

    let listings;

    if (city) {
      listings = await searchListings(city);
    } else if (hostId) {
      listings = await getAllListings({ hostId, maxResults });
    } else {
      listings = await getAllListings({ maxResults });
    }

    return NextResponse.json({ listings }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

// POST /api/listings - Create new listing
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

    // Validate required fields
    if (!body.title || !body.description || !body.location || !body.pricePerNight) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const listingId = await createListing(userId, body);

    return NextResponse.json(
      { listingId, message: 'Listing created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create listing' },
      { status: 500 }
    );
  }
}
