import {
  collection,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User } from '@enatbet/shared';

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
    phone: data.phone,
    photoURL: data.photoURL,
    role: data.role,
    status: data.status || 'active',
    stripeAccountId: data.stripeAccountId,
    stripeCustomerId: data.stripeCustomerId,
    isVerified: data.isVerified || false,
    verificationDocuments: data.verificationDocuments || [],
    favorites: data.favorites || [],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (!docSnap.exists()) return null;
    return convertToUser(docSnap.id, docSnap.data());
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user');
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Pick<User, 'displayName' | 'phone' | 'photoURL'>>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

// Add listing to favorites
export const addFavorite = async (
  userId: string,
  listingId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      favorites: arrayUnion(listingId),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add favorite');
  }
};

// Remove listing from favorites
export const removeFavorite = async (
  userId: string,
  listingId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      favorites: arrayRemove(listingId),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to remove favorite');
  }
};

// Get user's favorite listings
export const getUserFavorites = async (userId: string): Promise<string[]> => {
  try {
    const user = await getUserById(userId);
    return user?.favorites || [];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get favorites');
  }
};

// Check if listing is favorited by user
export const isFavorited = async (
  userId: string,
  listingId: string
): Promise<boolean> => {
  try {
    const favorites = await getUserFavorites(userId);
    return favorites.includes(listingId);
  } catch (error: any) {
    return false;
  }
};

// Update host profile statistics
export const updateHostStats = async (
  hostId: string,
  updates: {
    totalListings?: number;
    totalBookings?: number;
    averageRating?: number;
    responseRate?: number;
    responseTime?: number;
  }
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', hostId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update host stats');
  }
};

// Complete host onboarding
export const completeHostOnboarding = async (
  userId: string,
  stripeAccountId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: 'host',
      stripeAccountId,
      onboardingComplete: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to complete onboarding');
  }
};
