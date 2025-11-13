import { NextRequest, NextResponse } from 'next/server';
import {
  createReview,
  getListingReviews,
  canUserReview,
} from '@enatbet/firebase';
import { adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// GET /api/reviews - Get reviews for a listing
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json(
        { error: 'listingId required' },
        { status: 400 }
      );
    }

    const reviews = await getListingReviews(listingId);

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a review
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
    const { listingId, bookingId, rating, comment, cleanliness, accuracy, communication, location, value } = body;

    // Validate required fields
    if (!listingId || !bookingId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate ratings are between 1-5
    const ratings = [rating, cleanliness, accuracy, communication, location, value];
    if (ratings.some(r => r < 1 || r > 5)) {
      return NextResponse.json(
        { error: 'Ratings must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user can review
    const canReview = await canUserReview(userId, bookingId);
    if (!canReview) {
      return NextResponse.json(
        { error: 'Cannot review this booking' },
        { status: 403 }
      );
    }

    const reviewId = await createReview(body);

    return NextResponse.json(
      { reviewId, message: 'Review created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}
