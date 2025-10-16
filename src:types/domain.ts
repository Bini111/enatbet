// src/types/domain.ts
import { Timestamp, FirestoreDataConverter } from 'firebase/firestore';

/**
 * Core domain types for EnatBet app
 * 
 * NOTE: Firestore Converters Usage
 * ================================
 * Use these converters when reading/writing to Firestore to ensure
 * Timestamp <-> Date conversion happens automatically:
 * 
 * Example:
 * const listingRef = doc(db, 'listings', id).withConverter(listingConverter);
 * const listingSnap = await getDoc(listingRef);
 * const listing = listingSnap.data(); // listing.createdAt is Date, not Timestamp
 */

export enum UserRole {
  GUEST = 'guest',
  HOST = 'host',
  ADMIN = 'admin',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  GUESTHOUSE = 'guesthouse',
  HOTEL = 'hotel',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

export interface Pricing {
  basePrice: number;
  currency: string;
  cleaningFee?: number;
  serviceFee?: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
}

export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photoURL?: string;
  bio?: string;
  role: UserRole;
  isHost: boolean;
  isVerified: boolean;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  hostId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  address: Address;
  pricing: Pricing;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  coverImage: string;
  houseRules?: string[];
  checkInTime: string;
  checkOutTime: string;
  minimumStay: number;
  maximumStay?: number;
  isPublished: boolean;
  averageRating?: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  listingId: string;
  guestId: string;
  hostId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  nights: number;
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
  status: BookingStatus;
  paymentId?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  read: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  conversationKey?: string;
  participantIds: string[];
  participants: User[];
  listingId?: string;
  lastMessage?: Message;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  listingId: string;
  bookingId: string;
  guestId: string;
  rating: number;
  comment: string;
  hostResponse?: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId?: string;
  receiptUrl?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  location?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  priceMin?: number;
  priceMax?: number;
  propertyType?: PropertyType;
  amenities?: string[];
}

export interface BookingCalculation {
  nights: number;
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  discount: number;
  totalPrice: number;
}

/**
 * Firestore Data Converters
 * Automatically convert Timestamp <-> Date
 */

const timestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore: (user: User) => ({
    ...user,
    createdAt: dateToTimestamp(user.createdAt),
    updatedAt: dateToTimestamp(user.updatedAt),
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      ...data,
      uid: snapshot.id,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as User;
  },
};

export const listingConverter: FirestoreDataConverter<Listing> = {
  toFirestore: (listing: Listing) => ({
    ...listing,
    createdAt: dateToTimestamp(listing.createdAt),
    updatedAt: dateToTimestamp(listing.updatedAt),
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as Listing;
  },
};

export const bookingConverter: FirestoreDataConverter<Booking> = {
  toFirestore: (booking: Booking) => ({
    ...booking,
    checkIn: dateToTimestamp(booking.checkIn),
    checkOut: dateToTimestamp(booking.checkOut),
    createdAt: dateToTimestamp(booking.createdAt),
    updatedAt: dateToTimestamp(booking.updatedAt),
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
      checkIn: timestampToDate(data.checkIn),
      checkOut: timestampToDate(data.checkOut),
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as Booking;
  },
};

export const messageConverter: FirestoreDataConverter<Message> = {
  toFirestore: (message: Message) => ({
    ...message,
    createdAt: dateToTimestamp(message.createdAt),
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
      createdAt: timestampToDate(data.createdAt),
    } as Message;
  },
};

export const conversationConverter: FirestoreDataConverter<Conversation> = {
  toFirestore: (conversation: Conversation) => ({
    ...conversation,
    createdAt: dateToTimestamp(conversation.createdAt),
    updatedAt: dateToTimestamp(conversation.updatedAt),
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as Conversation;
  },
};

export const paymentConverter: FirestoreDataConverter<Payment> = {
  toFirestore: (payment: Payment) => ({
    ...payment,
    createdAt: dateToTimestamp(payment.createdAt),
    updatedAt: dateToTimestamp(payment.updatedAt),
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as Payment;
  },
};