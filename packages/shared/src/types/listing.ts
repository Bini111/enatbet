/**
 * Listing/Property Types
 */

export interface Listing {
  id: string;
  hostId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  roomType: RoomType;
  location: Location;
  amenities: Amenity[];
  images: ListingImage[];
  pricing: Pricing;
  availability: Availability;
  rules: ListingRules;
  capacity: Capacity;
  status: ListingStatus;
  stats: ListingStats;
  featured: boolean;
  instantBook: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyType = 'apartment' | 'house' | 'villa' | 'condo' | 'guesthouse' | 'hotel' | 'hostel';
export type RoomType = 'entire_place' | 'private_room' | 'shared_room';
export type ListingStatus = 'draft' | 'active' | 'inactive' | 'suspended' | 'archived';

export interface Location {
  address: string;
  street?: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  neighborhood?: string;
  publicTransport?: string[];
}

export interface ListingImage {
  url: string;
  caption?: string;
  order: number;
  thumbnail?: string;
  width?: number;
  height?: number;
}

export interface Pricing {
  basePrice: number;
  currency: string;
  cleaningFee: number;
  serviceFee: number;
  taxRate: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  customPricing?: CustomPricing[];
}

export interface CustomPricing {
  startDate: Date;
  endDate: Date;
  price: number;
  reason?: string;
}

export interface Availability {
  minNights: number;
  maxNights: number;
  advanceNotice: number; // hours
  preparationTime: number; // hours between bookings
  blockedDates: Date[];
  customAvailability?: CustomAvailability[];
}

export interface CustomAvailability {
  startDate: Date;
  endDate: Date;
  available: boolean;
  reason?: string;
}

export interface ListingRules {
  checkInTime: string;
  checkOutTime: string;
  flexibleCheckIn: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  partiesAllowed: boolean;
  childrenAllowed: boolean;
  customRules?: string[];
  cancelPolicy: CancelPolicy;
}

export type CancelPolicy = 'flexible' | 'moderate' | 'strict' | 'super_strict';

export interface Capacity {
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
}

export interface ListingStats {
  views: number;
  favorites: number;
  bookings: number;
  rating: number;
  reviewCount: number;
  responseRate: number;
  responseTime: number; // in minutes
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
  | 'garden'
  | 'hot_tub'
  | 'bbq'
  | 'elevator'
  | 'wheelchair_accessible'
  | 'pet_friendly'
  | 'smoke_alarm'
  | 'carbon_monoxide_alarm'
  | 'first_aid_kit'
  | 'fire_extinguisher'
  | 'security_cameras'
  | 'doorman'
  | '24_hour_checkin';
