import { create } from "zustand";
import { Property, SearchFilters } from "../types";

// Mock data for now
const mockProperties: Property[] = [
  {
    id: "1",
    hostId: "host1",
    title: "Luxury Beach Villa",
    description: "Beautiful beachfront property with stunning ocean views",
    pricePerNight: 250,
    location: {
      address: "123 Beach Road",
      city: "Miami",
      country: "USA",
      coordinates: { lat: 25.7617, lng: -80.1918 },
    },
    amenities: ["WiFi", "Pool", "Beach Access", "Kitchen"],
    images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    rating: 4.8,
    reviewCount: 124,
    status: "active",
    createdAt: new Date(),
  },
  {
    id: "2",
    hostId: "host2",
    title: "Modern City Apartment",
    description: "Stylish apartment in the heart of downtown",
    pricePerNight: 150,
    location: {
      address: "456 Main St",
      city: "New York",
      country: "USA",
      coordinates: { lat: 40.7128, lng: -74.006 },
    },
    amenities: ["WiFi", "Gym", "Parking", "Kitchen"],
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    rating: 4.5,
    reviewCount: 89,
    status: "active",
    createdAt: new Date(),
  },
];

interface PropertyState {
  properties: Property[];
  featuredProperties: Property[];
  isLoading: boolean;
  error: string | null;

  fetchProperties: (filters?: SearchFilters) => Promise<void>;
  fetchFeaturedProperties: () => Promise<void>;
  getPropertyById: (id: string) => Property | undefined;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: mockProperties,
  featuredProperties: mockProperties,
  isLoading: false,
  error: null,

  fetchProperties: async (filters?: SearchFilters) => {
    set({ isLoading: true, error: null });
    // Simulate API call
    setTimeout(() => {
      set({ properties: mockProperties, isLoading: false });
    }, 500);
  },

  fetchFeaturedProperties: async () => {
    set({ featuredProperties: mockProperties });
  },

  getPropertyById: (id: string) => {
    const { properties, featuredProperties } = get();
    return (
      properties.find((p) => p.id === id) ||
      featuredProperties.find((p) => p.id === id)
    );
  },
}));
