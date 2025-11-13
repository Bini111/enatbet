/**
 * Enatebet Shared Package - Main Exports
 * Types, utilities, and validation schemas shared across web and mobile
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export * from './types/domain';

// Also export from types/index.ts for backward compatibility
export type {
  User,
  Property,
  Booking,
  Review,
  SearchFilters,
} from './types/index';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export * from './schemas/validation';

// ============================================================================
// UTILITIES
// ============================================================================

export * from './utils/helpers';
export * from './utils/money';

// ============================================================================
// LIBRARIES
// ============================================================================

export * from './lib/rate-limiter';
