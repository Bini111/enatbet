export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "guest" | "host" | "admin";
  createdAt: Date;
}

export interface Property {
  id: string;
  hostId: string;
  title: string;
  description: string;
  pricePerNight: number;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  images: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  rating?: number;
  reviewCount?: number;
  status: "active" | "inactive" | "pending";
  createdAt: Date;
}

export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  hostId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentIntentId?: string;
  createdAt: Date;
}

export interface SearchFilters {
  location?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  amenities?: string[];
}
