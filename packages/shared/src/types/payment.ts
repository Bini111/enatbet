/**
 * Payment and Transaction Types
 */

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  clientSecret: string;
  paymentMethod?: string;
  bookingId: string;
  createdAt: Date;
  metadata: Record<string, string>;
}

export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'canceled';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  card?: CardDetails;
  isDefault: boolean;
  createdAt: Date;
}

export type PaymentMethodType = 'card' | 'bank_transfer' | 'wallet';

export interface CardDetails {
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  country?: string;
  funding?: CardFunding;
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unionpay' | 'unknown';
export type CardFunding = 'credit' | 'debit' | 'prepaid' | 'unknown';

export interface Refund {
  id: string;
  amount: number;
  currency: string;
  reason: RefundReason;
  status: RefundStatus;
  bookingId: string;
  paymentIntentId: string;
  createdAt: Date;
  processedAt?: Date;
}

export type RefundReason = 'requested_by_customer' | 'duplicate' | 'fraudulent' | 'host_cancelled';
export type RefundStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled';

export interface Payout {
  id: string;
  hostId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  bookingIds: string[];
  stripeTransferId?: string;
  bankAccount?: BankAccount;
  scheduledDate: Date;
  paidDate?: Date;
  failureReason?: string;
}

export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'cancelled';

export interface BankAccount {
  id: string;
  accountHolderName: string;
  last4: string;
  bankName?: string;
  country: string;
  currency: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  userId: string;
  bookingId?: string;
  description: string;
  createdAt: Date;
  metadata: Record<string, any>;
}

export type TransactionType = 'booking' | 'refund' | 'payout' | 'fee' | 'adjustment';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';

export interface Invoice {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  items: InvoiceLineItem[];
  pdfUrl?: string;
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
}

export interface HostEarnings {
  hostId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalEarnings: number;
  totalBookings: number;
  averageNightlyRate: number;
  occupancyRate: number;
  upcomingPayouts: number;
  pendingPayouts: number;
  paidOut: number;
  currency: string;
  breakdown: EarningsBreakdown[];
}

export interface EarningsBreakdown {
  date: Date;
  bookingId: string;
  listingTitle: string;
  nights: number;
  grossEarnings: number;
  serviceFee: number;
  netEarnings: number;
  status: 'pending' | 'paid';
}
