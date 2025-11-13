import { NextRequest, NextResponse } from 'next/server';
import { getListingById, updateListing, deleteListing } from '@enatebet/firebase';

/**
 * GET /api/listings/[id] - Get listing by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await getListingById(params.id);

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: listing });
  } catch (error: any) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/listings/[id] - Update listing
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!updates) {
      return NextResponse.json(
        { success: false, error: 'Updates are required' },
        { status: 400 }
      );
    }

    await updateListing(params.id, updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update listing' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/[id] - Delete (soft delete) listing
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteListing(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
