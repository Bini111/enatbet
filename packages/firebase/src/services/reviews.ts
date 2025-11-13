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
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Review, ReviewCreate, Booking } from '@enatebet/shared';

/**
 * Review Service
 * Handles property reviews and ratings
 */

// Convert Firestore document to Review
const convertToReview = (docId: string, data: any): Review => {
  return {
    id: docId,
    bookingId: data.bookingId,
    listingId: data.listingId,
    reviewerId: data.reviewerId,
    revieweeId: data.revieweeId,
    type: data.type,
    ratings: data.ratings,
    comment: data.comment,
    photos: data.photos || [],
    response: data.response,
    status: data.status || 'published',
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

/**
 * Check if user can review (must have completed booking)
 */
export const canUserReview = async (
  userId: string,
  bookingId: string
): Promise<{ canReview: boolean; reason?: string }> => {
  try {
    // Get booking
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    if (!bookingDoc.exists()) {
      return { canReview: false, reason: 'Booking not found' };
    }

    const booking = bookingDoc.data();

    // Check if user is guest or host
    const isGuest = booking.guestId === userId;
    const isHost = booking.hostId === userId;

    if (!isGuest && !isHost) {
      return { canReview: false, reason: 'You are not part of this booking' };
    }

    // Check if booking is completed
    if (booking.status !== 'checked_out' && booking.status !== 'completed') {
      return { canReview: false, reason: 'Booking must be completed to leave a review' };
    }

    // Check if already reviewed
    const reviewType = isGuest ? 'guest_to_host' : 'host_to_guest';
    const existingReviewQuery = query(
      collection(db, 'reviews'),
      where('bookingId', '==', bookingId),
      where('reviewerId', '==', userId),
      where('type', '==', reviewType)
    );

    const existingReviews = await getDocs(existingReviewQuery);
    if (!existingReviews.empty) {
      return { canReview: false, reason: 'You have already reviewed this booking' };
    }

    // Check if review window has expired (14 days after checkout)
    const checkoutDate = booking.checkOut?.toDate();
    if (checkoutDate) {
      const daysSinceCheckout = (Date.now() - checkoutDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCheckout > 14) {
        return { canReview: false, reason: 'Review window has expired (14 days after checkout)' };
      }
    }

    return { canReview: true };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to check review eligibility');
  }
};

/**
 * Create a review
 */
export const createReview = async (
  reviewerId: string,
  reviewData: ReviewCreate
): Promise<string> => {
  try {
    // Check if user can review
    const eligibility = await canUserReview(reviewerId, reviewData.bookingId);
    if (!eligibility.canReview) {
      throw new Error(eligibility.reason || 'Cannot create review');
    }

    // Get booking to determine review type and reviewee
    const bookingDoc = await getDoc(doc(db, 'bookings', reviewData.bookingId));
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }

    const booking = bookingDoc.data();
    const isGuest = booking.guestId === reviewerId;
    const reviewType = isGuest ? 'guest_to_host' : 'host_to_guest';
    const revieweeId = isGuest ? booking.hostId : booking.guestId;

    // Create review document
    const docData = {
      bookingId: reviewData.bookingId,
      listingId: reviewData.listingId,
      reviewerId,
      revieweeId,
      type: reviewType,
      ratings: reviewData.ratings,
      comment: reviewData.comment,
      photos: reviewData.photos || [],
      status: 'published',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'reviews'), docData);

    // Update listing stats
    await updateListingRating(reviewData.listingId);

    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create review');
  }
};

/**
 * Get listing reviews
 */
export const getListingReviews = async (
  listingId: string,
  limitCount: number = 10
): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('listingId', '==', listingId),
      where('status', '==', 'published'),
      where('type', '==', 'guest_to_host'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertToReview(doc.id, doc.data()));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get reviews');
  }
};

/**
 * Get user reviews (reviews written by user)
 */
export const getUserReviews = async (userId: string): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('reviewerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertToReview(doc.id, doc.data()));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user reviews');
  }
};

/**
 * Get reviews about user (received reviews)
 */
export const getReviewsAboutUser = async (userId: string): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('revieweeId', '==', userId),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertToReview(doc.id, doc.data()));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get reviews about user');
  }
};

/**
 * Get review by ID
 */
export const getReviewById = async (reviewId: string): Promise<Review | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'reviews', reviewId));
    if (!docSnap.exists()) return null;
    return convertToReview(docSnap.id, docSnap.data());
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get review');
  }
};

/**
 * Update review (within 48 hours of creation)
 */
export const updateReview = async (
  reviewId: string,
  userId: string,
  updates: Partial<ReviewCreate>
): Promise<void> => {
  try {
    const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));
    if (!reviewDoc.exists()) {
      throw new Error('Review not found');
    }

    const review = reviewDoc.data();

    // Check if user is the reviewer
    if (review.reviewerId !== userId) {
      throw new Error('You can only update your own reviews');
    }

    // Check if within 48-hour window
    const createdAt = review.createdAt?.toDate();
    if (createdAt) {
      const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreation > 48) {
        throw new Error('Reviews can only be edited within 48 hours of posting');
      }
    }

    await updateDoc(doc(db, 'reviews', reviewId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Recalculate listing rating
    if (review.listingId) {
      await updateListingRating(review.listingId);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update review');
  }
};

/**
 * Add host response to review
 */
export const addReviewResponse = async (
  reviewId: string,
  hostId: string,
  responseText: string
): Promise<void> => {
  try {
    const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));
    if (!reviewDoc.exists()) {
      throw new Error('Review not found');
    }

    const review = reviewDoc.data();

    // Check if user is the host
    if (review.revieweeId !== hostId) {
      throw new Error('Only the host can respond to this review');
    }

    // Check if already responded
    if (review.response) {
      throw new Error('You have already responded to this review');
    }

    await updateDoc(doc(db, 'reviews', reviewId), {
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

/**
 * Calculate and update listing average rating
 */
export const updateListingRating = async (listingId: string): Promise<void> => {
  try {
    const reviews = await getListingReviews(listingId, 1000); // Get all reviews

    if (reviews.length === 0) {
      await updateDoc(doc(db, 'listings', listingId), {
        'stats.rating': 0,
        'stats.reviewCount': 0,
      });
      return;
    }

    // Calculate average overall rating
    const totalRating = reviews.reduce((sum, review) => sum + review.ratings.overall, 0);
    const averageRating = totalRating / reviews.length;

    await updateDoc(doc(db, 'listings', listingId), {
      'stats.rating': parseFloat(averageRating.toFixed(2)),
      'stats.reviewCount': reviews.length,
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update listing rating');
  }
};

/**
 * Calculate average rating for listing
 */
export const calculateAverageRating = async (listingId: string): Promise<number> => {
  try {
    const reviews = await getListingReviews(listingId, 1000);

    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + review.ratings.overall, 0);
    return parseFloat((totalRating / reviews.length).toFixed(2));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to calculate rating');
  }
};

/**
 * Flag review for moderation
 */
export const flagReview = async (
  reviewId: string,
  userId: string,
  reason: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'reviews', reviewId), {
      status: 'flagged',
      flaggedBy: userId,
      flagReason: reason,
      flaggedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to flag review');
  }
};
