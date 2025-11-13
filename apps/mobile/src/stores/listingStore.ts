import { create } from 'zustand';
import { Listing } from '@enatbet/shared';
import {
  getAllListings,
  getListingById,
  searchListings,
  getHostListings,
} from '@enatbet/firebase';

interface ListingState {
  listings: Listing[];
  selectedListing: Listing | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchListings: () => Promise<void>;
  fetchListingById: (id: string) => Promise<void>;
  searchByCity: (city: string) => Promise<void>;
  fetchHostListings: (hostId: string) => Promise<void>;
  clearSelectedListing: () => void;
  clearError: () => void;
}

export const useListingStore = create<ListingState>((set) => ({
  listings: [],
  selectedListing: null,
  isLoading: false,
  error: null,

  fetchListings: async () => {
    set({ isLoading: true, error: null });
    try {
      const listings = await getAllListings({ maxResults: 50 });
      set({ listings, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchListingById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const listing = await getListingById(id);
      set({ selectedListing: listing, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  searchByCity: async (city: string) => {
    set({ isLoading: true, error: null });
    try {
      const listings = await searchListings(city);
      set({ listings, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchHostListings: async (hostId: string) => {
    set({ isLoading: true, error: null });
    try {
      const listings = await getHostListings(hostId);
      set({ listings, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearSelectedListing: () => set({ selectedListing: null }),

  clearError: () => set({ error: null }),
}));
