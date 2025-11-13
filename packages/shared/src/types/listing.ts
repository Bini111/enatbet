import { Money } from './money';

export type ListingStatus = 'draft' | 'published' | 'suspended' | 'deleted';
export type PropertyType = 'apartment' | 'house' | 'villa' | 'cottage' | 'hotel' | 'guesthouse';
export type RoomType = 'entire_place' | 'private_room' | 'shared_room';

export interface Location {
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
}

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
}

export interface ListingImage {
  url: string;
  caption?: string;
  order: number;
}

export interface Listing {
  id: string;
  hostId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  roomType: RoomType;
  location: Location;
  images: ListingImage[];
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  pricePerNight: Money;
  cleaningFee?: Money;
  minimumStay: number;
  maximumStay?: number;
  status: ListingStatus;
  instantBook: boolean;
  averageRating?: number;
  totalReviews: number;
  totalBookings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateListingInput {
  title: string;
  description: string;
  propertyType: PropertyType;
  roomType: RoomType;
  location: Location;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  pricePerNight: Money;
  cleaningFee?: Money;
  minimumStay?: number;
  instantBook?: boolean;
}

export interface UpdateListingInput extends Partial<CreateListingInput> {
  status?: ListingStatus;
}
