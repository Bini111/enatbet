/**
 * Booking and Reservation Types
 */

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
  confirmationCode: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus =
  | 'pending'
  | 'pending_payment'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'refunded'
  | 'expired';

export interface GuestInfo {
  adults: number;
  children: number;
  infants: number;
  pets: number;
  totalGuests: number;
}

export interface BookingPricing {
  nights: number;
  pricePerNight: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  discounts: number;
  total: number;
  currency: string;
  breakdown: PriceLineItem[];
}

export interface PriceLineItem {
  type: PriceLineItemType;
  label: string;
  amount: number;
  description?: string;
}

export type PriceLineItemType =
  | 'accommodation'
  | 'cleaning'
  | 'service'
  | 'tax'
  | 'discount'
  | 'total';

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  receiptUrl?: string;
}

export type PaymentMethod = 'stripe' | 'card' | 'wallet' | 'bank_transfer';
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'cancelled';

export interface CancellationInfo {
  reason: string;
  cancelledBy: 'guest' | 'host' | 'admin' | 'system';
  cancelledAt: Date;
  refundAmount: number;
  refundStatus: PaymentStatus;
  penaltyAmount: number;
  policy: string;
}

export interface BookingRequest {
  listingId: string;
  checkIn: Date;
  checkOut: Date;
  guests: GuestInfo;
  specialRequests?: string;
}

export interface BookingConfirmation {
  bookingId: string;
  confirmationCode: string;
  listing: {
    id: string;
    title: string;
    address: string;
    images: string[];
  };
  host: {
    id: string;
    name: string;
    photo?: string;
    phone?: string;
  };
  checkIn: Date;
  checkOut: Date;
  guests: GuestInfo;
  pricing: BookingPricing;
  instructions?: CheckInInstructions;
}

export interface CheckInInstructions {
  accessCode?: string;
  lockboxCode?: string;
  directions: string;
  parkingInfo?: string;
  wifiPassword?: string;
  houseManualUrl?: string;
}
