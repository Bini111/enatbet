import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  collectionGroup,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Review, CreateReviewInput, ReviewSummary } from '@enatbet/shared';

/**
 * Review Service
 * Handles review CRUD operations and rating calculations
 */

// Convert Firestore document to Review
const convertToReview = (docId: string, listingId: string, data: any): Review => {
  return {
    id: docId,
    listingId,
    bookingId: data.bookingId,
    guestId: data.guestId,
    hostId: data.hostId,
    rating: data.rating,
    comment: data.comment,
    cleanliness: data.cleanliness,
    accuracy: data.accuracy,
    communication: data.communication,
    location: data.location,
    value: data.value,
    response: data.response ? {
      text: data.response.text,
      createdAt: data.response.createdAt?.toDate() || new Date(),
    } : undefined,
    flagged: data.flagged || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Create review
export const createReview = async (
  input: CreateReviewInput
): Promise<string> => {
  try {
    // Get booking to verify it's completed and get hostId
    const bookingDoc = await getDoc(doc(db, 'bookings', input.bookingId));
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }

    const booking = bookingDoc.data();
    if (booking.status !== 'completed') {
      throw new Error('Can only review completed bookings');
    }

    // Check if review already exists
    const existingReviewQuery = query(
      collectionGroup(db, 'reviews'),
      where('bookingId', '==', input.bookingId)
    );
    const existingReviews = await getDocs(existingReviewQuery);
    if (!existingReviews.empty) {
      throw new Error('Review already exists for this booking');
    }

    // Create review in listing subcollection
    const reviewData = {
      ...input,
      guestId: booking.guestId,
      hostId: booking.hostId,
      flagged: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, 'listings', input.listingId, 'reviews'),
      reviewData
    );

    // Update listing stats
    await updateListingRating(input.listingId);

    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create review');
  }
};

// Get listing reviews
export const getListingReviews = async (
  listingId: string,
  maxResults: number = 50
): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, 'listings', listingId, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertToReview(doc.id, listingId, doc.data()));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get reviews');
  }
};

// Calculate and update listing rating
export const updateListingRating = async (listingId: string): Promise<void> => {
  try {
    const reviews = await getListingReviews(listingId, 1000);

    if (reviews.length === 0) {
      await updateDoc(doc(db, 'listings', listingId), {
        averageRating: 0,
        totalReviews: 0,
        updatedAt: serverTimestamp(),
      });
      return;
    }

    const summary = calculateReviewSummary(reviews);

    await updateDoc(doc(db, 'listings', listingId), {
      averageRating: summary.averageRating,
      totalReviews: summary.totalReviews,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update rating');
  }
};

// Calculate review summary
export const calculateReviewSummary = (reviews: Review[]): ReviewSummary => {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      location: 0,
      value: 0,
    };
  }

  const sum = reviews.reduce(
    (acc, review) => ({
      rating: acc.rating + review.rating,
      cleanliness: acc.cleanliness + review.cleanliness,
      accuracy: acc.accuracy + review.accuracy,
      communication: acc.communication + review.communication,
      location: acc.location + review.location,
      value: acc.value + review.value,
    }),
    {
      rating: 0,
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      location: 0,
      value: 0,
    }
  );

  const count = reviews.length;

  return {
    averageRating: Math.round((sum.rating / count) * 10) / 10,
    totalReviews: count,
    cleanliness: Math.round((sum.cleanliness / count) * 10) / 10,
    accuracy: Math.round((sum.accuracy / count) * 10) / 10,
    communication: Math.round((sum.communication / count) * 10) / 10,
    location: Math.round((sum.location / count) * 10) / 10,
    value: Math.round((sum.value / count) * 10) / 10,
  };
};

// Get review summary for listing
export const getListingReviewSummary = async (
  listingId: string
): Promise<ReviewSummary> => {
  try {
    const reviews = await getListingReviews(listingId, 1000);
    return calculateReviewSummary(reviews);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get review summary');
  }
};

// Check if user can review (booking must be completed and not already reviewed)
export const canUserReview = async (
  userId: string,
  bookingId: string
): Promise<boolean> => {
  try {
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    if (!bookingDoc.exists()) return false;

    const booking = bookingDoc.data();
    if (booking.guestId !== userId || booking.status !== 'completed') {
      return false;
    }

    // Check if review already exists
    const existingReviewQuery = query(
      collectionGroup(db, 'reviews'),
      where('bookingId', '==', bookingId)
    );
    const existingReviews = await getDocs(existingReviewQuery);

    return existingReviews.empty;
  } catch (error: any) {
    return false;
  }
};

// Host response to review
export const addHostResponse = async (
  listingId: string,
  reviewId: string,
  responseText: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'listings', listingId, 'reviews', reviewId), {
      response: {
        text: responseText,
        createdAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add response');
  }
};

// Flag review for moderation
export const flagReview = async (
  listingId: string,
  reviewId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'listings', listingId, 'reviews', reviewId), {
      flagged: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to flag review');
  }
};
