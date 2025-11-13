import type { PriceBreakdown } from './money';

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled' 
  | 'completed' 
  | 'refunded'
  | 'checked_in'
  | 'checked_out';

export interface Booking {
  id: string;
  listingId: string;
  guestId: string;
  hostId: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  pricing: PriceBreakdown;
  status: BookingStatus;
  paymentIntentId?: string;
  stripeChargeId?: string;
  specialRequests?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingInput {
  listingId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  specialRequests?: string;
}

export interface BookingAvailability {
  available: boolean;
  conflictingBookings?: string[];
  message?: string;
}

export interface CancelBookingInput {
  bookingId: string;
  reason: string;
  cancelledBy: 'guest' | 'host' | 'admin';
}
