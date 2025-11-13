import { NextRequest, NextResponse } from 'next/server';
import { getListingById, updateListing, deleteListing } from '@enatbet/firebase';
import { adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// GET /api/listings/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await getListingById(params.id);

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ listing }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

// PUT /api/listings/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Verify user owns the listing
    const listing = await getListingById(params.id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.hostId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    await updateListing(params.id, body);

    return NextResponse.json(
      { message: 'Listing updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update listing' },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Verify user owns the listing
    const listing = await getListingById(params.id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.hostId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteListing(params.id);

    return NextResponse.json(
      { message: 'Listing deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
