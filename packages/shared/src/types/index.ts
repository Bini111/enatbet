/**
 * Shared Type Exports
 * Central export point for all type definitions
 */

// Export all types from domain-specific modules
export * from './user';
export * from './listing';
export * from './booking';
export * from './payment';
export * from './money';
export * from './domain';

// Re-export commonly used types for convenience
export type { User, UserRole, UserStatus, UserProfile } from './user';
export type { Listing, PropertyType, RoomType, ListingStatus } from './listing';
export type { Booking, BookingStatus, GuestInfo, BookingPricing } from './booking';
export type { PaymentIntent, PaymentMethod, PaymentStatus } from './payment';
export type { Money, Currency, PriceBreakdown } from './money';

// Backward compatibility aliases for existing code
export type Property = Listing;
export type { Review, SearchFilters, SearchResult } from './domain';
