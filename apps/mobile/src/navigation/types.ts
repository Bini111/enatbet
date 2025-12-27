// ============================================
// ROOT STACK PARAM LIST
// ============================================
export type RootStackParamList = {
  // Main Navigation
  MainTabs: undefined;
  HostTabs: undefined;
  AdminTabs: undefined;
  
  // Guest Screens
  Home: undefined;
  Search: { location?: string; filters?: SearchFilters };
  PropertyDetails: { propertyId?: string; listingId?: string };
  Booking: { propertyId?: string; listingId?: string; checkIn?: string; checkOut?: string; guests?: number };
  BookingConfirmation: { bookingId: string };
  Checkout: { bookingId: string };
  TripDetails: { bookingId: string };
  
  // Auth Screens
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ProfileOnboarding: undefined;
  
  // Profile & Settings
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  NotificationSettings: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
  
  // Messages
  Messages: undefined;
  Chat: { conversationId: string; recipientId?: string; recipientName?: string; bookingId?: string };
  
  // Bookings
  MyBookings: undefined;
  
  // Favorites
  Favorites: undefined;
  
  // Reviews
  WriteReview: { bookingId: string; listingId: string; listingTitle?: string; hostId?: string };
  ViewReviews: { listingId: string; listingTitle?: string };
  
  // Host Screens - Direct listing creation (no BecomeAHost gate)
  HostDashboard: undefined;
  ManageListings: undefined;
  CreateListingStep1: { listingData?: Partial<ListingFormData> };
  CreateListingStep2: { listingData: Partial<ListingFormData> };
  CreateListingStep3: { listingData: Partial<ListingFormData> };
  CreateListingStep4: { listingData: Partial<ListingFormData> };
  CreateListingStep5: { listingData: ListingFormData };
  EditListing: { listingId: string };
  HostCalendar: { listingId?: string };
  HostBookings: undefined;
  HostBookingDetails: { bookingId: string };
  Earnings: undefined;
  PayoutSettings: undefined;
  
  // Admin Screens
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminUserDetails: { userId: string };
  AdminListings: undefined;
  AdminListingDetails: { listingId: string };
  AdminReports: undefined;
  AdminReportDetails: { reportId: string };
  AdminSubAdmins: undefined;
  
  // Search & Filters
  Filters: { currentFilters?: SearchFilters; onApply?: (filters: SearchFilters) => void };
  
  // Legal & Info
  About: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  HostAgreement: undefined;
  CancellationPolicy: undefined;
  Contact: undefined;
  Resources: undefined;
  HelpCenter: undefined;
};

// ============================================
// TAB PARAM LISTS
// ============================================
export type GuestTabParamList = {
  Explore: undefined;
  Bookings: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type HostTabParamList = {
  Dashboard: undefined;
  Listings: undefined;
  Calendar: undefined;
  HostMessages: undefined;
  HostProfile: undefined;
};

export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminListings: undefined;
  AdminReports: undefined;
  AdminSettings: undefined;
};

// ============================================
// DATA TYPES
// ============================================

// User Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  phone?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  languages?: string[];
  role?: 'guest' | 'host' | 'admin';
  isHost?: boolean;
  isAdmin?: boolean;
  verified?: boolean;
  isVerified?: boolean;
  banned?: boolean;
  banReason?: string;
  bannedAt?: any;
  bannedBy?: string;
  warnings?: Warning[];
  stripeAccountId?: string;
  stripeCustomerId?: string;
  telebirrAccount?: string;
  preferredCurrency?: 'USD' | 'ETB';
  instagramHandle?: string;
  twitterHandle?: string;
  website?: string;
  onboardingCompleted?: boolean;
  listingsCount?: number;
  paymentMethods?: PaymentMethod[];
  notificationPreferences?: NotificationPreferences;
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
}

export interface Warning {
  id: string;
  reason: string;
  issuedBy: string;
  issuedAt: any;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  brand?: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  marketing: boolean;
  bookingReminders: boolean;
  messageAlerts: boolean;
  priceAlerts: boolean;
}

// Listing Types
export interface Listing {
  id: string;
  hostId: string;
  hostName?: string;
  hostPhoto?: string;
  
  // Basic Info
  title: string;
  description: string;
  propertyType: PropertyType;
  
  // Location
  country: string;
  city: string;
  address: string;
  airportDistance?: string;
  neighborhood?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  // Capacity
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  
  // Amenities
  amenities: string[];
  houseRules?: string[];
  
  // Photos
  photos: ListingPhoto[];
  coverPhoto?: string;
  
  // Pricing
  currency: 'USD' | 'ETB';
  pricePerNight: number;
  cleaningFee?: number;
  serviceFee?: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  
  // Availability
  isActive: boolean;
  instantBook: boolean;
  minimumStay: number;
  maximumStay?: number;
  checkInTime: string;
  checkOutTime: string;
  
  // Calendar - blocked dates and custom pricing
  blockedDates?: string[];
  customPricing?: CustomPricing[];
  
  // Reviews & Stats
  averageRating?: number;
  reviewCount?: number;
  bookingCount?: number;
  
  // Status - listings start as 'draft' or 'pending_approval'
  status: ListingStatus;
  
  // Cancellation
  cancellationPolicy: CancellationPolicy;
  
  // Timestamps
  createdAt?: any;
  updatedAt?: any;
  publishedAt?: any;
  submittedAt?: any;
  approvedAt?: any;
  approvedBy?: string;
}

export interface ListingPhoto {
  id: string;
  url: string;
  type: 'bedroom' | 'bathroom' | 'kitchen' | 'living' | 'exterior' | 'other';
  caption?: string;
  order: number;
}

export interface CustomPricing {
  date: string;
  price: number;
}

export type PropertyType = 
  | 'Apartment' 
  | 'House' 
  | 'Condo' 
  | 'Townhouse' 
  | 'Villa' 
  | 'Cabin' 
  | 'Private Room' 
  | 'Shared Room' 
  | 'Other';

// Updated ListingStatus - key change: listings submit as 'pending_approval'
export type ListingStatus = 
  | 'draft'              // User is still creating/editing
  | 'pending_approval'   // Submitted, waiting for admin review
  | 'active'             // Approved and live
  | 'inactive'           // Host paused the listing
  | 'suspended'          // Admin suspended
  | 'rejected'           // Admin rejected
  | 'deleted';           // Soft deleted

export type CancellationPolicy = 
  | 'flexible' 
  | 'moderate' 
  | 'strict' 
  | 'super_strict';

// Listing Form Data (for create/edit wizard)
export interface ListingFormData {
  // Step 1: Basics
  title: string;
  description: string;
  propertyType: PropertyType;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  
  // Step 2: Location
  country: string;
  city: string;
  address: string;
  airportDistance: string;
  neighborhood: string;
  
  // Step 3: Photos
  photos: ListingPhoto[];
  
  // Step 4: Pricing & Rules
  currency: 'USD' | 'ETB';
  pricePerNight: number;
  cleaningFee: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  minimumStay: number;
  maximumStay: number;
  checkInTime: string;
  checkOutTime: string;
  instantBook: boolean;
  cancellationPolicy: CancellationPolicy;
  houseRules: string[];
}

// Booking Types
export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPhoto?: string;
  
  guestId: string;
  guestName: string;
  guestPhoto?: string;
  guestPhone?: string;
  guestEmail?: string;
  
  hostId: string;
  hostName: string;
  hostPhoto?: string;
  
  checkIn: any;
  checkOut: any;
  nights: number;
  guests: number;
  
  // Pricing
  currency: 'USD' | 'ETB';
  pricePerNight: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
  
  // Status
  status: BookingStatus;
  
  // Payment
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  paymentMethod?: string;
  
  // Messages
  guestMessage?: string;
  hostNotes?: string;
  
  // Cancellation
  cancelledAt?: any;
  cancelledBy?: 'guest' | 'host' | 'admin';
  cancellationReason?: string;
  refundAmount?: number;
  refundStatus?: 'pending' | 'processed' | 'failed';
  
  // Timestamps
  createdAt?: any;
  updatedAt?: any;
  confirmedAt?: any;
  completedAt?: any;
}

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled' 
  | 'rejected' 
  | 'completed';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'succeeded' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

// Search & Filters
export interface SearchFilters {
  location?: string;
  country?: string;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  priceMin?: number;
  priceMax?: number;
  propertyType?: PropertyType[];
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  instantBook?: boolean;
  currency?: 'USD' | 'ETB';
}

// Review Types
export interface Review {
  id: string;
  bookingId: string;
  listingId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerPhoto?: string;
  revieweeId: string;
  reviewType: 'guest_to_host' | 'host_to_guest' | 'guest_to_listing';
  rating: number;
  comment: string;
  
  // Category ratings (optional)
  cleanlinessRating?: number;
  communicationRating?: number;
  checkInRating?: number;
  accuracyRating?: number;
  locationRating?: number;
  valueRating?: number;
  
  // Response
  hostResponse?: string;
  hostResponseAt?: any;
  
  createdAt?: any;
  updatedAt?: any;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: any;
  createdAt?: any;
}

export type NotificationType = 
  | 'booking_request' 
  | 'booking_confirmed' 
  | 'booking_cancelled' 
  | 'booking_completed'
  | 'new_message' 
  | 'new_review' 
  | 'payout_sent'
  | 'listing_approved'
  | 'listing_rejected'
  | 'listing_suspended'
  | 'account_warning'
  | 'account_banned'
  | 'admin_request'
  | 'system';

// Earnings & Payouts
export interface Earning {
  id: string;
  hostId: string;
  bookingId: string;
  listingId: string;
  listingTitle: string;
  guestName: string;
  
  currency: 'USD' | 'ETB';
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  
  status: 'pending' | 'available' | 'paid_out' | 'on_hold';
  
  payoutId?: string;
  paidOutAt?: any;
  
  createdAt?: any;
}

export interface Payout {
  id: string;
  hostId: string;
  
  currency: 'USD' | 'ETB';
  amount: number;
  
  method: 'stripe' | 'telebirr' | 'bank_transfer';
  accountDetails?: string;
  telebirrAccount?: string;
  
  status: 'pending' | 'processing' | 'completed' | 'failed';
  failureReason?: string;
  
  transactionId?: string;
  
  createdAt?: any;
  completedAt?: any;
}

// Report Types (for admin)
export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  
  type: 'listing' | 'user' | 'booking' | 'review' | 'message';
  targetId: string;
  targetType: string;
  
  reason: string;
  description: string;
  evidence?: string[];
  
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: any;
  
  createdAt?: any;
  updatedAt?: any;
}

// Conversation Types
export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  
  listingId?: string;
  listingTitle?: string;
  bookingId?: string;
  
  lastMessage?: string;
  lastMessageAt?: any;
  lastMessageBy?: string;
  
  unreadCount: Record<string, number>;
  
  createdAt?: any;
  updatedAt?: any;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  
  text: string;
  imageUrl?: string;
  
  read: boolean;
  readAt?: any;
  
  createdAt?: any;
}

// ============================================
// CONSTANTS
// ============================================

// Amenities List
export const AMENITIES_LIST = [
  // Essentials
  { id: 'wifi', label: 'WiFi', icon: '📶', category: 'essentials' },
  { id: 'kitchen', label: 'Kitchen', icon: '🍳', category: 'essentials' },
  { id: 'washer', label: 'Washer', icon: '🧺', category: 'essentials' },
  { id: 'dryer', label: 'Dryer', icon: '👕', category: 'essentials' },
  { id: 'ac', label: 'Air Conditioning', icon: '❄️', category: 'essentials' },
  { id: 'heating', label: 'Heating', icon: '🔥', category: 'essentials' },
  { id: 'tv', label: 'TV', icon: '📺', category: 'essentials' },
  { id: 'iron', label: 'Iron', icon: '👔', category: 'essentials' },
  
  // Parking & Facilities
  { id: 'free_parking', label: 'Free Parking', icon: '🚗', category: 'facilities' },
  { id: 'paid_parking', label: 'Paid Parking', icon: '🅿️', category: 'facilities' },
  { id: 'pool', label: 'Pool', icon: '🏊', category: 'facilities' },
  { id: 'gym', label: 'Gym', icon: '💪', category: 'facilities' },
  { id: 'hot_tub', label: 'Hot Tub', icon: '🛁', category: 'facilities' },
  { id: 'elevator', label: 'Elevator', icon: '🛗', category: 'facilities' },
  
  // Safety
  { id: 'smoke_alarm', label: 'Smoke Alarm', icon: '🚨', category: 'safety' },
  { id: 'fire_extinguisher', label: 'Fire Extinguisher', icon: '🧯', category: 'safety' },
  { id: 'first_aid', label: 'First Aid Kit', icon: '🩹', category: 'safety' },
  { id: 'security_camera', label: 'Security Camera', icon: '📹', category: 'safety' },
  
  // Outdoor
  { id: 'balcony', label: 'Balcony', icon: '🌅', category: 'outdoor' },
  { id: 'garden', label: 'Garden', icon: '🌳', category: 'outdoor' },
  { id: 'bbq', label: 'BBQ Grill', icon: '🍖', category: 'outdoor' },
  { id: 'patio', label: 'Patio', icon: '🪑', category: 'outdoor' },
  
  // Family
  { id: 'crib', label: 'Crib', icon: '👶', category: 'family' },
  { id: 'high_chair', label: 'High Chair', icon: '🪑', category: 'family' },
  { id: 'kids_toys', label: 'Kids Toys', icon: '🧸', category: 'family' },
  
  // Work
  { id: 'workspace', label: 'Dedicated Workspace', icon: '💻', category: 'work' },
  
  // Ethiopian/Eritrean Special
  { id: 'coffee_ceremony', label: 'Coffee Ceremony Set', icon: '☕', category: 'cultural' },
  { id: 'injera_kitchen', label: 'Injera Kitchen', icon: '🫓', category: 'cultural' },
  { id: 'ethiopian_coffee', label: 'Ethiopian Coffee', icon: '☕', category: 'cultural' },
];

// House Rules Options
export const HOUSE_RULES_OPTIONS = [
  { id: 'no_smoking', label: 'No smoking', icon: '🚭' },
  { id: 'no_pets', label: 'No pets', icon: '🐾' },
  { id: 'no_parties', label: 'No parties or events', icon: '🎉' },
  { id: 'quiet_hours', label: 'Quiet hours (10 PM - 8 AM)', icon: '🤫' },
  { id: 'no_unregistered_guests', label: 'No unregistered guests', icon: '👥' },
  { id: 'shoes_off', label: 'Remove shoes indoors', icon: '👟' },
  { id: 'respect_neighbors', label: 'Respect neighbors', icon: '🏘️' },
];

// Countries with diaspora communities
export const COUNTRIES_WITH_CITIES: Record<string, string[]> = {
  'United States': [
    'Washington DC', 'Los Angeles', 'Seattle', 'Dallas', 'Atlanta',
    'Minneapolis', 'Denver', 'San Jose', 'Oakland', 'New York',
    'Houston', 'Phoenix', 'Las Vegas', 'Columbus', 'San Diego', 'Other'
  ],
  'Canada': [
    'Toronto', 'Ottawa', 'Calgary', 'Edmonton', 'Vancouver',
    'Montreal', 'Winnipeg', 'Other'
  ],
  'United Kingdom': [
    'London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol', 'Other'
  ],
  'Germany': [
    'Frankfurt', 'Berlin', 'Munich', 'Stuttgart', 'Hamburg', 'Cologne', 'Other'
  ],
  'Sweden': ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Other'],
  'Norway': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Other'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Other'],
  'Italy': ['Rome', 'Milan', 'Bologna', 'Turin', 'Other'],
  'Israel': ['Tel Aviv', 'Jerusalem', 'Haifa', 'Netanya', 'Other'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Other'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Other'],
  'Australia': ['Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide', 'Other'],
  'South Africa': ['Johannesburg', 'Cape Town', 'Pretoria', 'Durban', 'Other'],
  'Kenya': ['Nairobi', 'Mombasa', 'Other'],
  'Sudan': ['Khartoum', 'Port Sudan', 'Other'],
  'Ethiopia': [
    'Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Hawassa',
    'Mekelle', 'Gondar', 'Adama', 'Other'
  ],
  'Eritrea': ['Asmara', 'Massawa', 'Keren', 'Assab', 'Other'],
};