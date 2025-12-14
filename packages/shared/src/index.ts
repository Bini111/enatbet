/**
 * Shared package - Types, utilities, and constants
 * Explicit exports to avoid circular dependencies
 */

// Type-only exports from types
export type { Money, PriceBreakdown } from './types/money';
export type { User, UserRole, UserStatus, HostProfile, CreateUserInput } from './types/user';
export type { Listing, ListingStatus, PropertyType, RoomType, Location, CreateListingInput, UpdateListingInput } from './types/listing';
export type { Booking, BookingStatus, CreateBookingInput, BookingAvailability, CancelBookingInput } from './types/booking';
export type { Payment, PaymentStatus, CreatePaymentIntentInput, CreatePaymentIntentResponse, RefundInput } from './types/payment';
export type { Review, CreateReviewInput, ReviewSummary } from './types/review';
export type { Message, Conversation, MessageType, CreateMessageInput, CreateConversationInput } from './types/message';
export type { Notification, NotificationType, CreateNotificationInput } from './types/notification';

// Runtime exports from types/money
export { CURRENCY_SYMBOLS, formatMoney } from './types/money';

// Constants - explicit exports to avoid Currency conflict
export {
  CURRENCIES,
  DEFAULT_CURRENCY,
  isCurrency,
  getCurrencyInfo,
  toMinorUnits,
  fromMinorUnits,
  STRIPE_MIN_CHARGE_MINOR_UNITS,
  meetsStripeMinimum,
  getStripeMinimumMajor,
  ZERO_DECIMAL_CURRENCIES,
  isZeroDecimal,
  CONFIG_KEYS
} from './constants/currencies';
export type { Currency, StripeMinCurrency } from './constants/currencies';

// Utilities
export * from './utils/money';
export * from './utils/validation';
export * from './utils/date';
