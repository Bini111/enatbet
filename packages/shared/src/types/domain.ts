/**
 * Shared Domain Types for Enatebet Platform
 * Used across web and mobile apps
 */

// User & Authentication
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: UserMetadata;
}

export type UserRole = 'guest' | 'host' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface UserMetadata {
  lastLoginAt?: Date;
  loginCount: number;
  preferredLanguage: 'en' | 'am';
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

// Listing
export interface Listing {
  id: string;
  hostId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  roomType: RoomType;
  location: Location;
  amenities: Amenity[];
  images: string[];
  pricing: Pricing;
  availability: Availability;
  rules: ListingRules;
  status: ListingStatus;
  stats: ListingStats;
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyType = 'apartment' | 'house' | 'villa' | 'condo' | 'guesthouse';
export type RoomType = 'entire_place' | 'private_room' | 'shared_room';
export type ListingStatus = 'draft' | 'active' | 'inactive' | 'suspended';

export interface Location {
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Pricing {
  basePrice: number;
  currency: string;
  cleaningFee: number;
  serviceFee: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
}

export interface Availability {
  minNights: number;
  maxNights: number;
  blockedDates: Date[];
  availableDates: Date[];
}

export interface ListingRules {
  checkInTime: string;
  checkOutTime: string;
  maxGuests: number;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  partiesAllowed: boolean;
  childrenAllowed: boolean;
  customRules?: string[];
}

export interface ListingStats {
  views: number;
  favorites: number;
  bookings: number;
  rating: number;
  reviewCount: number;
}

export type Amenity =
  | 'wifi'
  | 'kitchen'
  | 'parking'
  | 'pool'
  | 'gym'
  | 'ac'
  | 'heating'
  | 'tv'
  | 'washer'
  | 'dryer'
  | 'workspace'
  | 'fireplace'
  | 'balcony'
  | 'garden';

// Booking
export interface Booking {
  id: string;
  listingId: string;
  guestId: string;
  hostId: string;
  checkIn: Date;
  checkOut: Date;
  guests: GuestInfo;
  pricing: BookingPricing;
  status: BookingStatus;
  payment: PaymentInfo;
  cancellation?: CancellationInfo;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'refunded';

export interface GuestInfo {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export interface BookingPricing {
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
  currency: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  stripePaymentIntentId?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
}

export type PaymentMethod = 'stripe' | 'card' | 'wallet';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';

export interface CancellationInfo {
  reason: string;
  cancelledBy: 'guest' | 'host' | 'admin';
  cancelledAt: Date;
  refundAmount: number;
  refundStatus: PaymentStatus;
}

// Review
export interface Review {
  id: string;
  bookingId: string;
  listingId: string;
  reviewerId: string;
  revieweeId: string;
  type: ReviewType;
  ratings: Ratings;
  comment: string;
  photos?: string[];
  response?: ReviewResponse;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewType = 'guest_to_host' | 'host_to_guest';
export type ReviewStatus = 'pending' | 'published' | 'flagged' | 'removed';

export interface Ratings {
  overall: number;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location: number;
  value: number;
}

export interface ReviewResponse {
  text: string;
  createdAt: Date;
}

// Messaging
export interface Conversation {
  id: string;
  participants: string[];
  listingId?: string;
  bookingId?: string;
  lastMessage?: Message;
  unreadCount: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  type: MessageType;
  metadata?: MessageMetadata;
  readBy: string[];
  createdAt: Date;
}

export type MessageType = 'text' | 'image' | 'system' | 'booking_request' | 'booking_update';

export interface MessageMetadata {
  imageUrl?: string;
  bookingId?: string;
  systemEvent?: string;
}

// Search & Filters
export interface SearchFilters {
  location?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: GuestInfo;
  priceRange?: {
    min: number;
    max: number;
  };
  propertyTypes?: PropertyType[];
  amenities?: Amenity[];
  instantBook?: boolean;
}

export interface SearchResult {
  listings: Listing[];
  total: number;
  page: number;
  pageSize: number;
  facets?: SearchFacets;
}

export interface SearchFacets {
  propertyTypes: Record<PropertyType, number>;
  priceRanges: Array<{
    min: number;
    max: number;
    count: number;
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Analytics Events
export type AnalyticsEvent =
  | 'listing_viewed'
  | 'listing_searched'
  | 'booking_started'
  | 'booking_completed'
  | 'profile_updated'
  | 'message_sent'
  | 'review_submitted';

export interface AnalyticsPayload {
  event: AnalyticsEvent;
  userId?: string;
  properties: Record<string, any>;
  timestamp: Date;
}

// ============================================================================
// CREATE/UPDATE INPUT TYPES
// ============================================================================

// Listing Create/Update
export interface ListingCreate {
  title: string;
  description: string;
  propertyType: PropertyType;
  roomType: RoomType;
  location: Location;
  amenities: Amenity[];
  images: string[];
  pricing: Pricing;
  capacity: {
    guests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
  };
  rules: ListingRules;
}

export type ListingUpdate = Partial<ListingCreate>;

// Booking Create
export interface BookingCreate {
  listingId: string;
  checkIn: Date;
  checkOut: Date;
  guests: GuestInfo;
  specialRequests?: string;
}

// Review Create
export interface ReviewCreate {
  bookingId: string;
  listingId: string;
  ratings: Ratings;
  comment: string;
  photos?: string[];
}

// Message Create
export interface MessageCreate {
  conversationId: string;
  text: string;
  type?: MessageType;
  metadata?: MessageMetadata;
}

// User Profile Update
export interface UserProfileUpdate {
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  bio?: string;
  languages?: string[];
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'new_message'
  | 'review_received'
  | 'payment_received'
  | 'booking_reminder'
  | 'listing_approved';

// ============================================================================
// CONSTANTS
// ============================================================================

export const SUPPORTED_CURRENCIES = ['USD', 'CAD', 'EUR', 'GBP', 'ETB'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];
