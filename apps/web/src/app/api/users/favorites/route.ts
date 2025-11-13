import { NextRequest, NextResponse } from 'next/server';
import { addFavorite, removeFavorite, getUserFavorites } from '@enatbet/firebase';
import { adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// GET /api/users/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const favorites = await getUserFavorites(userId);

    return NextResponse.json({ favorites }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST /api/users/favorites - Add to favorites
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
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: 'listingId required' },
        { status: 400 }
      );
    }

    await addFavorite(userId, listingId);

    return NextResponse.json(
      { message: 'Added to favorites' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/favorites - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const searchParams = request.nextUrl.searchParams;
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json(
        { error: 'listingId required' },
        { status: 400 }
      );
    }

    await removeFavorite(userId, listingId);

    return NextResponse.json(
      { message: 'Removed from favorites' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
