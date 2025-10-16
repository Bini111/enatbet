// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  bio?: string;
  languages: string[];
  isHost: boolean;
  verified: {
    email: boolean;
    phone: boolean;
    id: boolean;
  };
  communityVerification: {
    status: 'pending' | 'approved' | 'rejected';
    method: 'self_attestation' | 'id_upload';
    idDocumentURL?: string;
  };
  stats?: {
    averageRating: number;
    totalReviews: number;
    responseRate: number;
    responseTime: number; // in minutes
  };
  badges?: {
    superhost: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Listing Types
export interface Listing {
  id: string;
  hostId: string;
  host?: User;
  title: string;
  description: string;
  propertyType: 'apartment' | 'house' | 'condo' | 'other';
  roomType: 'entire_place' | 'private_room' | 'shared_room';
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  pricing: {
    nightly: number;
    cleaning: number;
    currency: 'USD' | 'EUR' | 'ETB';
  };
  capacity: {
    guests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
  };
  amenities: string[];
  culturalAmenities: string[];
  images: string[];
  availability: {
    calendar: Record<string, boolean>; // 'YYYY-MM-DD' -> available
    instantBook: boolean;
  };
  houseRules?: string;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  status: 'active' | 'inactive' | 'pending_approval';
  stats?: {
    views: number;
    favorites: number;
    bookingRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Booking Types
export interface Booking {
  id: string;
  listingId: string;
  listing?: Listing;
  hostId: string;
  host?: User;
  guestId: string;
  guest?: User;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  pricing: {
    nightly: number;
    nights: number;
    subtotal: number;
    cleaningFee: number;
    hostServiceFee: number; // 3%
    guestServiceFee: number; // 14%
    total: number;
    currency: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentIntentId?: string;
  cancellationReason?: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export interface Conversation {
  id: string;
  participants: string[];
  listingId?: string;
  bookingId?: string;
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Date;
  };
  unreadCount: Record<string, number>; // userId -> count
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  imageURL?: string;
  translatedText?: Record<string, string>; // language -> translated text
  timestamp: Date;
  read: boolean;
}

// Review Types
export interface Review {
  id: string;
  bookingId: string;
  listingId: string;
  reviewerId: string;
  reviewer?: User;
  revieweeId: string;
  reviewee?: User;
  type: 'guest_to_host' | 'host_to_guest';
  rating: {
    overall: number; // 1-5
    cleanliness?: number;
    accuracy?: number;
    communication?: number;
    location?: number;
    value?: number;
  };
  comment?: string;
  createdAt: Date;
}

// Search & Filter Types
export interface SearchFilters {
  location?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  priceMin?: number;
  priceMax?: number;
  roomType?: 'entire_place' | 'private_room' | 'shared_room';
  amenities?: string[];
  culturalAmenities?: string[];
  instantBook?: boolean;
  superhost?: boolean;
}

// Wishlist Types
export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  listingIds: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface PaymentIntent {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'cancelled';
  clientSecret: string;
  createdAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'new_message' | 'new_review' | 'payment_received';
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

// Event Types (Community)
export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  location: {
    name: string;
    address: string;
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  date: Date;
  type: 'festival' | 'concert' | 'meetup' | 'cultural' | 'religious';
  imageURL?: string;
  organizer: string;
  attendees?: number;
  externalLink?: string;
  createdAt: Date;
}

// Cultural Resource Types
export interface CulturalResource {
  id: string;
  name: string;
  type: 'restaurant' | 'church' | 'community_center' | 'store' | 'embassy';
  description?: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hours?: Record<string, string>; // day -> hours
  verified: boolean;
  createdAt: Date;
}

// Analytics Types
export interface ListingAnalytics {
  listingId: string;
  period: 'day' | 'week' | 'month' | 'year';
  views: number;
  favorites: number;
  bookingRequests: number;
  bookingRate: number;
  revenue: number;
  occupancyRate: number;
}

export interface HostAnalytics {
  hostId: string;
  totalEarnings: number;
  pendingEarnings: number;
  upcomingEarnings: number;
  totalBookings: number;
  averageRating: number;
  responseRate: number;
  listingsCount: number;
  superhostStatus: boolean;
}

// Form Types
export interface ListingFormData {
  title: string;
  description: string;
  propertyType: 'apartment' | 'house' | 'condo' | 'other';
  roomType: 'entire_place' | 'private_room' | 'shared_room';
  address: string;
  city: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  culturalAmenities: string[];
  images: string[];
  nightlyPrice: number;
  cleaningFee: number;
  currency: 'USD' | 'EUR' | 'ETB';
  instantBook: boolean;
  houseRules?: string;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
}

export interface BookingFormData {
  listingId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  specialRequests?: string;
}

export interface ProfileFormData {
  displayName: string;
  bio?: string;
  phoneNumber?: string;
  languages: string[];
  photoURL?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Auth Types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  phoneNumber?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  SignUp: undefined;
  PhoneVerification: { userId: string };
  CommunityVerification: { userId: string };
  ListingDetail: { listingId: string };
  Booking: { listing: Listing };
  Payment: { bookingId: string };
  Chat: { conversationId: string };
  EditProfile: undefined;
  CreateListing: undefined;
  EditListing: { listingId: string };
  LeaveReview: { bookingId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Trips: undefined;
  Inbox: undefined;
  Profile: undefined;
};

export type HostTabParamList = {
  Dashboard: undefined;
  Listings: undefined;
  Reservations: undefined;
  Earnings: undefined;
  HostProfile: undefined;
};