import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import listingService from '../services/listing.service';
import { Listing, SearchFilters, ListingFormData } from '../types';

interface ListingState {
  listings: Listing[];
  featuredListings: Listing[];
  searchResults: Listing[];
  userListings: Listing[];
  selectedListing: Listing | null;
  searchFilters: SearchFilters;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

interface ListingStore extends ListingState {
  // Actions
  fetchFeaturedListings: () => Promise<void>;
  searchListings: (filters?: SearchFilters) => Promise<void>;
  loadMoreListings: () => Promise<void>;
  getListingById: (id: string) => Promise<void>;
  getUserListings: (userId: string) => Promise<void>;
  createListing: (data: ListingFormData, hostId: string) => Promise<string>;
  updateListing: (id: string, data: Partial<ListingFormData>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  toggleFavorite: (listingId: string, userId: string) => Promise<boolean>;
  setSearchFilters: (filters: SearchFilters) => void;
  clearSearch: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useListingStore = create<ListingStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      listings: [],
      featuredListings: [],
      searchResults: [],
      userListings: [],
      selectedListing: null,
      searchFilters: {},
      isLoading: false,
      error: null,
      hasMore: true,
      page: 1,

      // Fetch featured listings
      fetchFeaturedListings: async () => {
        set({ isLoading: true, error: null });
        try {
          const listings = await listingService.getFeaturedListings();
          set({ 
            featuredListings: listings,
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          set({ 
            error: error.message,
            isLoading: false 
          });
        }
      },

      // Search listings
      searchListings: async (filters?: SearchFilters) => {
        const searchFilters = filters || get().searchFilters;
        set({ isLoading: true, error: null, searchFilters });
        
        try {
          const response = await listingService.searchListings(searchFilters);
          
          if (response.success && response.data) {
            set({ 
              searchResults: response.data,
              hasMore: response.pagination?.hasMore || false,
              page: 1,
              isLoading: false,
              error: null 
            });
          } else {
            throw new Error('Failed to search listings');
          }
        } catch (error: any) {
          set({ 
            error: error.message,
            searchResults: [],
            isLoading: false 
          });
        }
      },

      // Load more listings (pagination)
      loadMoreListings: async () => {
        const { searchFilters, page, hasMore, searchResults } = get();
        
        if (!hasMore || get().isLoading) return;
        
        set({ isLoading: true, error: null });
        
        try {
          const response = await listingService.searchListings(
            searchFilters,
            undefined, // lastDoc would be passed here
            20
          );
          
          if (response.success && response.data) {
            set({ 
              searchResults: [...searchResults, ...response.data],
              hasMore: response.pagination?.hasMore || false,
              page: page + 1,
              isLoading: false,
              error: null 
            });
          }
        } catch (error: any) {
          set({ 
            error: error.message,
            isLoading: false 
          });
        }
      },

      // Get listing by ID
      getListingById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const listing = await listingService.getListingById(id);
          
          if (listing) {
            set({ 
              selectedListing: listing,
              isLoading: false,
              error: null 
            });
          } else {
            throw new Error('Listing not found');
          }
        } catch (error: any) {
          set({ 
            error: error.message,
            selectedListing: null,
            isLoading: false 
          });
        }
      },

      // Get user's listings
      getUserListings: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const listings = await listingService.getListingsByHost(userId);
          set({ 
            userListings: listings,
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          set({ 
            error: error.message,
            userListings: [],
            isLoading: false 
          });
        }
      },

      // Create listing
      createListing: async (data: ListingFormData, hostId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Upload images first
          const uploadedImages = await listingService.uploadListingImages(
            data.images,
            `temp_${Date.now()}`
          );
          
          // Create listing with uploaded image URLs
          const listingId = await listingService.createListing(
            { ...data, images: uploadedImages },
            hostId
          );
          
          // Refresh user listings
          await get().getUserListings(hostId);
          
          set({ 
            isLoading: false,
            error: null 
          });
          
          return listingId;
        } catch (error: any) {
          set({ 
            error: error.message,
            isLoading: false 
          });
          throw error;
        }
      },

      // Update listing
      updateListing: async (id: string, data: Partial<ListingFormData>) => {
        set({ isLoading: true, error: null });
        try {
          // Upload new images if provided
          let updatedData = { ...data };
          if (data.images && data.images.some(img => img.startsWith('file://'))) {
            const newImages = data.images.filter(img => img.startsWith('file://'));
            const existingImages = data.images.filter(img => !img.startsWith('file://'));
            
            const uploadedImages = await listingService.uploadListingImages(newImages, id);
            updatedData.images = [...existingImages, ...uploadedImages];
          }
          
          await listingService.updateListing(id, updatedData);
          
          // Refresh the listing
          await get().getListingById(id);
          
          set({ 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          set({ 
            error: error.message,
            isLoading: false 
          });
          throw error;
        }
      },

      // Delete listing
      deleteListing: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await listingService.deleteListing(id);
          
          // Remove from local state
          const { userListings, searchResults, featuredListings } = get();
          set({
            userListings: userListings.filter(l => l.id !== id),
            searchResults: searchResults.filter(l => l.id !== id),
            featuredListings: featuredListings.filter(l => l.id !== id),
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({ 
            error: error.message,
            isLoading: false 
          });
          throw error;
        }
      },

      // Toggle favorite
      toggleFavorite: async (listingId: string, userId: string) => {
        try {
          const isFavorited = await listingService.toggleFavorite(listingId, userId);
          return isFavorited;
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      // Set search filters
      setSearchFilters: (filters: SearchFilters) => {
        set({ searchFilters: filters });
      },

      // Clear search
      clearSearch: () => {
        set({
          searchResults: [],
          searchFilters: {},
          page: 1,
          hasMore: true,
        });
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'listing-store',
    }
  )
);