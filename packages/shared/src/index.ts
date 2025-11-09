import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  photoURL: z.string().optional(),
  role: z.enum(['guest', 'host', 'admin']),
  createdAt: z.date(),
});

export const PropertySchema = z.object({
  id: z.string(),
  hostId: z.string(),
  title: z.string(),
  description: z.string(),
  pricePerNight: z.number(),
  location: z.object({
    address: z.string(),
    city: z.string(),
    country: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  amenities: z.array(z.string()),
  images: z.array(z.string()),
  maxGuests: z.number(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  status: z.enum(['active', 'inactive', 'pending']),
  createdAt: z.date(),
});

export const BookingSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  guestId: z.string(),
  hostId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number(),
  totalPrice: z.number(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  paymentIntentId: z.string().optional(),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
export type Property = z.infer<typeof PropertySchema>;
export type Booking = z.infer<typeof BookingSchema>;

// Export new types and utilities
export type { ListingCreate } from './types/listing';
export type { BookingCreate } from './types/booking';
export * from './types/notification';
export * from './types/domain';
export * from './constants/currencies';
export { MoneyUtils } from './utils/money';
export { RateLimiter } from './lib/rate-limiter';
