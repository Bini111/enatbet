import { NextRequest, NextResponse } from 'next/server';
import { createReview, getListingReviews } from '@enatebet/firebase';
import type { ReviewCreate } from '@enatebet/shared';

/**
 * POST /api/reviews - Create new review
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewerId, reviewData } = body;

    if (!reviewerId) {
      return NextResponse.json(
        { success: false, error: 'Reviewer ID is required' },
        { status: 400 }
      );
    }

    if (!reviewData) {
      return NextResponse.json(
        { success: false, error: 'Review data is required' },
        { status: 400 }
      );
    }

    const reviewId = await createReview(reviewerId, reviewData as ReviewCreate);

    return NextResponse.json(
      { success: true, data: { id: reviewId } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews - Get reviews for a listing
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const listingId = searchParams.get('listingId');
    const limit = searchParams.get('limit');

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    const reviews = await getListingReviews(
      listingId,
      limit ? parseInt(limit) : 10
    );

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
