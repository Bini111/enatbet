export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: 'guest' | 'host' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  description: string;
  pricePerNight: number;
  location: {
    address: string;
    city: string;
    state?: string;
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
  propertyType: 'house' | 'apartment' | 'room' | 'villa' | 'other';
  rating?: number;
  reviewCount?: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  guestId: string;
  guestName: string;
  hostId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentIntentId?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  propertyId: string;
  bookingId: string;
  guestId: string;
  guestName: string;
  rating: number;
  comment: string;
  cleanliness: number;
  communication: number;
  accuracy: number;
  location: number;
  value: number;
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
  propertyType?: string;
}
