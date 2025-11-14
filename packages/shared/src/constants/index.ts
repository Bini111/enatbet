/**
 * Shared Constants Export
 */

export * from './currencies';

/**
 * Application constants
 */
export const APP_NAME = 'Enatebet';
export const APP_DESCRIPTION = 'Ethiopian Property Booking Platform';
export const APP_VERSION = '1.0.0';

/**
 * Pagination defaults
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Image upload limits
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_LISTING = 20;
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

/**
 * Booking limits
 */
export const MIN_BOOKING_NIGHTS = 1;
export const MAX_BOOKING_NIGHTS = 365;
export const DEFAULT_ADVANCE_NOTICE_HOURS = 24;
export const DEFAULT_PREPARATION_TIME_HOURS = 2;

/**
 * Review constraints
 */
export const MIN_REVIEW_LENGTH = 20;
export const MAX_REVIEW_LENGTH = 2000;
export const REVIEW_EDIT_WINDOW_HOURS = 48;

/**
 * Rate limiting
 */
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const MAX_REQUESTS_PER_WINDOW = 100;

/**
 * Search limits
 */
export const MAX_SEARCH_RADIUS_KM = 50;
export const DEFAULT_SEARCH_RADIUS_KM = 10;

/**
 * Messaging limits
 */
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_CONVERSATION_MESSAGES = 1000;

/**
 * File storage paths
 */
export const STORAGE_PATHS = {
  LISTINGS: 'listings',
  PROFILES: 'profiles',
  DOCUMENTS: 'documents',
  REVIEWS: 'reviews',
} as const;

/**
 * Firestore collection names
 */
export const COLLECTIONS = {
  USERS: 'users',
  LISTINGS: 'listings',
  BOOKINGS: 'bookings',
  REVIEWS: 'reviews',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  NOTIFICATIONS: 'notifications',
  TRANSACTIONS: 'transactions',
  PAYOUTS: 'payouts',
} as const;

/**
 * API error codes
 */
export const ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Authorization
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Booking
  LISTING_NOT_AVAILABLE: 'LISTING_NOT_AVAILABLE',
  DATES_NOT_AVAILABLE: 'DATES_NOT_AVAILABLE',
  EXCEEDS_MAX_GUESTS: 'EXCEEDS_MAX_GUESTS',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',

  // Payment
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  REFUND_FAILED: 'REFUND_FAILED',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // Server
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Time constants
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Regex patterns
 */
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  URL: /^https?:\/\/.+/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;
