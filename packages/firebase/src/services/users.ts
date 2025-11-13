import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User, UserProfileUpdate, Listing } from '@enatebet/shared';

/**
 * User Service
 * Handles user profile management and favorites
 */

// Convert Firestore document to User
const convertToUser = (docId: string, data: any): User => {
  return {
    id: docId,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    phoneNumber: data.phoneNumber,
    role: data.role || 'guest',
    status: data.status || 'active',
    emailVerified: data.emailVerified || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    metadata: {
      lastLoginAt: data.metadata?.lastLoginAt?.toDate(),
      loginCount: data.metadata?.loginCount || 0,
      preferredLanguage: data.metadata?.preferredLanguage || 'en',
      notificationSettings: data.metadata?.notificationSettings || {
        email: true,
        push: true,
        sms: false,
        marketing: false,
      },
    },
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (!docSnap.exists()) return null;
    return convertToUser(docSnap.id, docSnap.data());
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user');
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const userDoc = snapshot.docs[0];
    return convertToUser(userDoc.id, userDoc.data());
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user by email');
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: UserProfileUpdate
): Promise<void> => {
  try {
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(doc(db, 'users', userId), updateData);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (
  userId: string,
  newRole: 'guest' | 'host' | 'admin'
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update role');
  }
};

/**
 * Update user status (admin only)
 */
export const updateUserStatus = async (
  userId: string,
  newStatus: 'active' | 'suspended' | 'deleted'
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update status');
  }
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (
  userId: string,
  settings: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    marketing?: boolean;
  }
): Promise<void> => {
  try {
    const user = await getUserById(userId);
    if (!user) throw new Error('User not found');

    const updatedSettings = {
      ...user.metadata.notificationSettings,
      ...settings,
    };

    await updateDoc(doc(db, 'users', userId), {
      'metadata.notificationSettings': updatedSettings,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update notification settings');
  }
};

/**
 * Update last login timestamp
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  try {
    const user = await getUserById(userId);
    if (!user) return;

    await updateDoc(doc(db, 'users', userId), {
      'metadata.lastLoginAt': serverTimestamp(),
      'metadata.loginCount': (user.metadata.loginCount || 0) + 1,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    // Don't throw error for login tracking failures
    console.error('Failed to update last login:', error);
  }
};

// ============================================================================
// FAVORITES MANAGEMENT
// ============================================================================

/**
 * Add listing to favorites
 */
export const addFavorite = async (userId: string, listingId: string): Promise<void> => {
  try {
    // Check if listing exists
    const listingDoc = await getDoc(doc(db, 'listings', listingId));
    if (!listingDoc.exists()) {
      throw new Error('Listing not found');
    }

    // Add to user's favorites subcollection
    await updateDoc(doc(db, 'users', userId), {
      favorites: arrayUnion(listingId),
      updatedAt: serverTimestamp(),
    });

    // Increment listing favorites count
    const listingData = listingDoc.data();
    const currentFavorites = listingData.stats?.favorites || 0;
    await updateDoc(doc(db, 'listings', listingId), {
      'stats.favorites': currentFavorites + 1,
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add favorite');
  }
};

/**
 * Remove listing from favorites
 */
export const removeFavorite = async (userId: string, listingId: string): Promise<void> => {
  try {
    // Remove from user's favorites
    await updateDoc(doc(db, 'users', userId), {
      favorites: arrayRemove(listingId),
      updatedAt: serverTimestamp(),
    });

    // Decrement listing favorites count
    const listingDoc = await getDoc(doc(db, 'listings', listingId));
    if (listingDoc.exists()) {
      const listingData = listingDoc.data();
      const currentFavorites = listingData.stats?.favorites || 0;
      await updateDoc(doc(db, 'listings', listingId), {
        'stats.favorites': Math.max(0, currentFavorites - 1),
      });
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to remove favorite');
  }
};

/**
 * Get user's favorite listings
 */
export const getFavorites = async (userId: string): Promise<Listing[]> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return [];

    const userData = userDoc.data();
    const favoriteIds = userData.favorites || [];

    if (favoriteIds.length === 0) return [];

    // Fetch all favorite listings
    // Note: In production, consider pagination for large lists
    const listingPromises = favoriteIds.map((id: string) =>
      getDoc(doc(db, 'listings', id))
    );

    const listingDocs = await Promise.all(listingPromises);

    return listingDocs
      .filter((doc) => doc.exists())
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          hostId: data.hostId,
          title: data.title,
          description: data.description,
          propertyType: data.propertyType,
          roomType: data.roomType,
          location: data.location,
          amenities: data.amenities || [],
          images: data.images || [],
          pricing: data.pricing,
          availability: data.availability,
          rules: data.rules,
          status: data.status,
          stats: data.stats || {
            views: 0,
            favorites: 0,
            bookings: 0,
            rating: 0,
            reviewCount: 0,
          },
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Listing;
      });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get favorites');
  }
};

/**
 * Check if listing is favorited by user
 */
export const isFavorited = async (userId: string, listingId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return false;

    const userData = userDoc.data();
    const favorites = userData.favorites || [];
    return favorites.includes(listingId);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to check favorite status');
  }
};

/**
 * Get favorite IDs (for quick checks)
 */
export const getFavoriteIds = async (userId: string): Promise<string[]> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return [];

    const userData = userDoc.data();
    return userData.favorites || [];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get favorite IDs');
  }
};

// ============================================================================
// USER STATS
// ============================================================================

/**
 * Get user statistics
 */
export const getUserStats = async (
  userId: string
): Promise<{
  totalBookings: number;
  totalReviews: number;
  averageRating: number;
  totalListings: number;
  totalEarnings: number;
}> => {
  try {
    // Get bookings count (as guest)
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('guestId', '==', userId)
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const totalBookings = bookingsSnapshot.size;

    // Get reviews count (received)
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('revieweeId', '==', userId),
      where('status', '==', 'published')
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const totalReviews = reviewsSnapshot.size;

    // Calculate average rating
    let averageRating = 0;
    if (totalReviews > 0) {
      const reviews = reviewsSnapshot.docs.map((doc) => doc.data());
      const totalRating = reviews.reduce((sum, review) => sum + review.ratings.overall, 0);
      averageRating = totalRating / totalReviews;
    }

    // Get listings count (as host)
    const listingsQuery = query(
      collection(db, 'listings'),
      where('hostId', '==', userId)
    );
    const listingsSnapshot = await getDocs(listingsQuery);
    const totalListings = listingsSnapshot.size;

    // Calculate total earnings (as host)
    const hostBookingsQuery = query(
      collection(db, 'bookings'),
      where('hostId', '==', userId),
      where('status', 'in', ['confirmed', 'checked_in', 'checked_out', 'completed'])
    );
    const hostBookingsSnapshot = await getDocs(hostBookingsQuery);
    const totalEarnings = hostBookingsSnapshot.docs.reduce((sum, doc) => {
      const booking = doc.data();
      return sum + (booking.pricing?.total || 0);
    }, 0);

    return {
      totalBookings,
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalListings,
      totalEarnings,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user stats');
  }
};
