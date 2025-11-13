import { NextRequest, NextResponse } from 'next/server';
import { getAllListings, searchListings, createListing } from '@enatebet/firebase';
import type { ListingCreate } from '@enatebet/shared';

/**
 * GET /api/listings - Get all or search listings
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const maxResults = searchParams.get('maxResults');

    if (city) {
      const listings = await searchListings(city);
      return NextResponse.json({ success: true, data: listings });
    }

    const options: any = {};
    if (maxResults) {
      options.maxResults = parseInt(maxResults);
    }

    const listings = await getAllListings(options);
    return NextResponse.json({ success: true, data: listings });
  } catch (error: any) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings - Create new listing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostId, listingData } = body;

    if (!hostId) {
      return NextResponse.json(
        { success: false, error: 'Host ID is required' },
        { status: 400 }
      );
    }

    if (!listingData) {
      return NextResponse.json(
        { success: false, error: 'Listing data is required' },
        { status: 400 }
      );
    }

    const listingId = await createListing(hostId, listingData as ListingCreate);

    return NextResponse.json(
      { success: true, data: { id: listingId } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create listing' },
      { status: 500 }
    );
  }
}
