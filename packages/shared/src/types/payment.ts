import { Money } from './money';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type PaymentMethod = 'card' | 'bank_transfer' | 'mobile_money';

export interface Payment {
  id: string;
  bookingId: string;
  guestId: string;
  hostId: string;
  amount: Money;
  platformFee: Money;
  hostPayout: Money;
  status: PaymentStatus;
  paymentIntentId: string;
  paymentMethod?: PaymentMethod;
  stripeChargeId?: string;
  refundId?: string;
  refundAmount?: Money;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentIntentInput {
  bookingId: string;
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  ephemeralKey?: string;
  customer?: string;
  publishableKey: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

export interface RefundInput {
  paymentIntentId: string;
  amount?: number;
  reason?: string;
}
