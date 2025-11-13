import { create } from 'zustand';
import { getAllListings, getListingById, searchListings } from '@enatebet/firebase';
import type { Listing, SearchFilters } from '@enatebet/shared';

interface PropertyState {
  properties: Listing[];
  featuredProperties: Listing[];
  isLoading: boolean;
  error: string | null;

  fetchProperties: (filters?: SearchFilters) => Promise<void>;
  fetchFeaturedProperties: () => Promise<void>;
  getPropertyById: (id: string) => Promise<Listing | null>;
  searchProperties: (city: string) => Promise<void>;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  featuredProperties: [],
  isLoading: false,
  error: null,

  fetchProperties: async (filters?: SearchFilters) => {
    set({ isLoading: true, error: null });
    try {
      const listings = await getAllListings({ maxResults: 50 });
      set({ properties: listings, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchFeaturedProperties: async () => {
    set({ isLoading: true, error: null });
    try {
      const listings = await getAllListings({ maxResults: 10 });
      set({ featuredProperties: listings, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  getPropertyById: async (id: string) => {
    try {
      const listing = await getListingById(id);
      return listing;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    }
  },

  searchProperties: async (city: string) => {
    set({ isLoading: true, error: null });
    try {
      const listings = await searchListings(city);
      set({ properties: listings, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
