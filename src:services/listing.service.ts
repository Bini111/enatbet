import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp,
  GeoPoint,
  increment,
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage, collections, storagePaths, getErrorMessage } from '../config/firebase';
import { Listing, ListingFormData, SearchFilters, ApiResponse } from '../types';

class ListingService {
  // Create a new listing
  async createListing(data: ListingFormData, hostId: string): Promise<string> {
    try {
      const listingRef = doc(collection(db, collections.listings));
      
      const listing = {
        hostId,
        title: data.title,
        description: data.description,
        propertyType: data.propertyType,
        roomType: data.roomType,
        location: {
          address: data.address,
          city: data.city,
          country: data.country,
          coordinates: new GeoPoint(
            data.coordinates?.latitude || 0,
            data.coordinates?.longitude || 0
          ),
        },
        pricing: {
          nightly: data.nightlyPrice,
          cleaning: data.cleaningFee,
          currency: data.currency,
        },
        capacity: {
          guests: data.guests,
          bedrooms: data.bedrooms,
          beds: data.beds,
          bathrooms: data.bathrooms,
        },
        amenities: data.amenities,
        culturalAmenities: data.culturalAmenities,
        images: data.images,
        availability: {
          calendar: {},
          instantBook: data.instantBook,
        },
        houseRules: data.houseRules,
        cancellationPolicy: data.cancellationPolicy,
        status: 'pending_approval', // Requires admin approval
        stats: {
          views: 0,
          favorites: 0,
          bookingRate: 0,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(listingRef, listing);
      return listingRef.id;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Get listing by ID
  async getListingById(listingId: string): Promise<Listing | null> {
    try {
      const listingDoc = await getDoc(doc(db, collections.listings, listingId));
      
      if (!listingDoc.exists()) {
        return null;
      }

      const listing = { id: listingDoc.id, ...listingDoc.data() } as Listing;

      // Increment view count
      await updateDoc(doc(db, collections.listings, listingId), {
        'stats.views': increment(1),
      });

      // Fetch host data
      if (listing.hostId) {
        const hostDoc = await getDoc(doc(db, collections.users, listing.hostId));
        if (hostDoc.exists()) {
          listing.host = { id: hostDoc.id, ...hostDoc.data() } as any;
        }
      }

      return listing;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Update listing
  async updateListing(listingId: string, updates: Partial<ListingFormData>): Promise<void> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Handle nested updates for location
      if (updates.address || updates.city || updates.country || updates.coordinates) {
        updateData.location = {
          address: updates.address,
          city: updates.city,
          country: updates.country,
          coordinates: updates.coordinates 
            ? new GeoPoint(updates.coordinates.latitude, updates.coordinates.longitude)
            : undefined,
        };
      }

      // Handle nested updates for pricing
      if (updates.nightlyPrice !== undefined || updates.cleaningFee !== undefined || updates.currency) {
        updateData.pricing = {
          nightly: updates.nightlyPrice,
          cleaning: updates.cleaningFee,
          currency: updates.currency,
        };
      }

      // Handle nested updates for capacity
      if (updates.guests || updates.bedrooms || updates.beds || updates.bathrooms) {
        updateData.capacity = {
          guests: updates.guests,
          bedrooms: updates.bedrooms,
          beds: updates.beds,
          bathrooms: updates.bathrooms,
        };
      }

      await updateDoc(doc(db, collections.listings, listingId), updateData);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Delete listing
  async deleteListing(listingId: string): Promise<void> {
    try {
      // Get listing to delete images
      const listing = await this.getListingById(listingId);
      
      if (listing) {
        // Delete images from storage
        for (const imageUrl of listing.images) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (error) {
            console.error('Error deleting image:', error);
          }
        }
      }

      // Delete listing document
      await deleteDoc(doc(db, collections.listings, listingId));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Search listings
  async searchListings(
    filters: SearchFilters,
    lastDoc?: DocumentSnapshot,
    pageSize: number = 20
  ): Promise<ApiResponse<Listing[]>> {
    try {
      let q = query(collection(db, collections.listings));

      // Apply filters
      q = query(q, where('status', '==', 'active'));

      if (filters.roomType) {
        q = query(q, where('roomType', '==', filters.roomType));
      }

      if (filters.priceMin !== undefined) {
        q = query(q, where('pricing.nightly', '>=', filters.priceMin));
      }

      if (filters.priceMax !== undefined) {
        q = query(q, where('pricing.nightly', '<=', filters.priceMax));
      }

      if (filters.guests) {
        q = query(q, where('capacity.guests', '>=', filters.guests));
      }

      if (filters.instantBook) {
        q = query(q, where('availability.instantBook', '==', true));
      }

      // Order and pagination
      q = query(q, orderBy('createdAt', 'desc'), limit(pageSize));

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const listings: Listing[] = [];

      for (const doc of querySnapshot.docs) {
        const listing = { id: doc.id, ...doc.data() } as Listing;
        
        // Filter by location (client-side for now)
        if (filters.location) {
          const locationLower = filters.location.toLowerCase();
          const cityMatch = listing.location.city.toLowerCase().includes(locationLower);
          const countryMatch = listing.location.country.toLowerCase().includes(locationLower);
          
          if (!cityMatch && !countryMatch) {
            continue;
          }
        }

        // Filter by dates (check availability)
        if (filters.checkIn && filters.checkOut) {
          const isAvailable = await this.checkAvailability(
            listing.id,
            filters.checkIn,
            filters.checkOut
          );
          
          if (!isAvailable) {
            continue;
          }
        }

        // Filter by amenities
        if (filters.amenities && filters.amenities.length > 0) {
          const hasAllAmenities = filters.amenities.every(amenity =>
            listing.amenities.includes(amenity)
          );
          
          if (!hasAllAmenities) {
            continue;
          }
        }

        // Filter by cultural amenities
        if (filters.culturalAmenities && filters.culturalAmenities.length > 0) {
          const hasAllCulturalAmenities = filters.culturalAmenities.every(amenity =>
            listing.culturalAmenities.includes(amenity)
          );
          
          if (!hasAllCulturalAmenities) {
            continue;
          }
        }

        listings.push(listing);
      }

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        success: true,
        data: listings,
        pagination: {
          page: 1,
          limit: pageSize,
          total: listings.length,
          hasMore: querySnapshot.docs.length === pageSize,
        },
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Get listings by host
  async getListingsByHost(hostId: string): Promise<Listing[]> {
    try {
      const q = query(
        collection(db, collections.listings),
        where('hostId', '==', hostId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const listings: Listing[] = [];

      querySnapshot.forEach((doc) => {
        listings.push({ id: doc.id, ...doc.data() } as Listing);
      });

      return listings;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Upload listing images
  async uploadListingImages(images: string[], listingId: string): Promise<string[]> {
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const fileName = `${listingId}_${Date.now()}_${i}.jpg`;
        const storageRef = ref(storage, `${storagePaths.listingImages}/${fileName}`);

        // Convert base64 to blob if needed
        const response = await fetch(image);
        const blob = await response.blob();

        // Upload to Firebase Storage
        const snapshot = await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        
        uploadedUrls.push(downloadUrl);
      }

      return uploadedUrls;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Check availability for dates
  async checkAvailability(
    listingId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<boolean> {
    try {
      // Get existing bookings for this listing
      const q = query(
        collection(db, collections.bookings),
        where('listingId', '==', listingId),
        where('status', 'in', ['confirmed', 'pending'])
      );

      const querySnapshot = await getDocs(q);

      // Check for conflicts
      for (const doc of querySnapshot.docs) {
        const booking = doc.data();
        const bookingCheckIn = booking.checkIn.toDate();
        const bookingCheckOut = booking.checkOut.toDate();

        // Check for date overlap
        if (
          (checkIn >= bookingCheckIn && checkIn < bookingCheckOut) ||
          (checkOut > bookingCheckIn && checkOut <= bookingCheckOut) ||
          (checkIn <= bookingCheckIn && checkOut >= bookingCheckOut)
        ) {
          return false; // Dates conflict
        }
      }

      return true; // Available
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }

  // Toggle favorite/wishlist
  async toggleFavorite(listingId: string, userId: string): Promise<boolean> {
    try {
      const wishlistRef = doc(db, 'wishlists', `${userId}_default`);
      const wishlistDoc = await getDoc(wishlistRef);

      let isFavorited = false;

      if (wishlistDoc.exists()) {
        const wishlist = wishlistDoc.data();
        const listingIds = wishlist.listingIds || [];
        
        if (listingIds.includes(listingId)) {
          // Remove from favorites
          await updateDoc(wishlistRef, {
            listingIds: listingIds.filter((id: string) => id !== listingId),
            updatedAt: serverTimestamp(),
          });
          
          // Decrement favorite count
          await updateDoc(doc(db, collections.listings, listingId), {
            'stats.favorites': increment(-1),
          });
        } else {
          // Add to favorites
          await updateDoc(wishlistRef, {
            listingIds: [...listingIds, listingId],
            updatedAt: serverTimestamp(),
          });
          
          // Increment favorite count
          await updateDoc(doc(db, collections.listings, listingId), {
            'stats.favorites': increment(1),
          });
          
          isFavorited = true;
        }
      } else {
        // Create new wishlist with this listing
        await setDoc(wishlistRef, {
          userId,
          name: 'My Favorites',
          listingIds: [listingId],
          isPrivate: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        // Increment favorite count
        await updateDoc(doc(db, collections.listings, listingId), {
          'stats.favorites': increment(1),
        });
        
        isFavorited = true;
      }

      return isFavorited;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Get featured listings
  async getFeaturedListings(): Promise<Listing[]> {
    try {
      const q = query(
        collection(db, collections.listings),
        where('status', '==', 'active'),
        orderBy('stats.bookingRate', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const listings: Listing[] = [];

      for (const doc of querySnapshot.docs) {
        const listing = { id: doc.id, ...doc.data() } as Listing;
        
        // Fetch host data
        if (listing.hostId) {
          const hostDoc = await getDoc(doc(db, collections.users, listing.hostId));
          if (hostDoc.exists()) {
            listing.host = { id: hostDoc.id, ...hostDoc.data() } as any;
          }
        }
        
        listings.push(listing);
      }

      return listings;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export default new ListingService()\