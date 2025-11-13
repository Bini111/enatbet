import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Listing, ListingCreate } from '@enatebet/shared';

// Define availability type locally since it's not exported from shared
interface Availability {
  blockedDates: Date[];
  customAvailability: Record<string, any>;
}

/**
 * Listing Service
 * Handles property listing CRUD operations
 */

// Convert Firestore document to Listing
const convertToListing = (docId: string, data: any): Listing => {
  return {
    id: docId,
    hostId: data.hostId,
    title: data.title,
    description: data.description,
    propertyType: data.propertyType,
    roomType: data.roomType,
    location: data.location,
    amenities: data.amenities || [],
    images: data.images || [],
    pricing: data.pricing,
    availability: {
      minNights: data.availability?.minNights || 1,
      maxNights: data.availability?.maxNights || 365,
      blockedDates: (data.availability?.blockedDates || []).map((ts: Timestamp) => ts.toDate()),
      availableDates: (data.availability?.availableDates || []).map((ts: Timestamp) => ts.toDate()),
    },
    rules: data.rules,
    status: data.status || 'active',
    stats: data.stats || {
      views: 0,
      favorites: 0,
      bookings: 0,
      rating: 0,
      reviewCount: 0,
    },
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Create new listing
export const createListing = async (
  hostId: string,
  listingData: ListingCreate
): Promise<string> => {
  try {
    const docData = {
      ...listingData,
      hostId,
      status: 'active',
      stats: {
        views: 0,
        favorites: 0,
        bookings: 0,
        rating: 0,
        reviewCount: 0,
      },
      availability: {
        blockedDates: [],
        customAvailability: {},
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'listings'), docData);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create listing');
  }
};

// Get listing by ID
export const getListingById = async (listingId: string): Promise<Listing | null> => {
  try {
    const docRef = doc(db, 'listings', listingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    // Increment view count
    await updateDoc(docRef, {
      'stats.views': (docSnap.data().stats?.views || 0) + 1,
    });

    return convertToListing(docSnap.id, docSnap.data());
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get listing');
  }
};

// Get all listings (with basic filter)
export const getAllListings = async (options?: {
  maxResults?: number;
  hostId?: string;
}): Promise<Listing[]> => {
  try {
    let q = query(
      collection(db, 'listings'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    if (options?.hostId) {
      q = query(
        collection(db, 'listings'),
        where('hostId', '==', options.hostId),
        orderBy('createdAt', 'desc')
      );
    }

    if (options?.maxResults) {
      q = query(q, limit(options.maxResults));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertToListing(doc.id, doc.data()));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get listings');
  }
};

// Search listings by city
export const searchListings = async (city: string): Promise<Listing[]> => {
  try {
    const q = query(
      collection(db, 'listings'),
      where('status', '==', 'active'),
      where('location.city', '==', city),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertToListing(doc.id, doc.data()));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to search listings');
  }
};

// Update listing
export const updateListing = async (
  listingId: string,
  updates: Partial<ListingCreate>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'listings', listingId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update listing');
  }
};

// Delete listing
export const deleteListing = async (listingId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'listings', listingId), {
      status: 'inactive',
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete listing');
  }
};

// Get host listings
export const getHostListings = async (hostId: string): Promise<Listing[]> => {
  return getAllListings({ hostId });
};
