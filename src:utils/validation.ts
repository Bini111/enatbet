// src/utils/validation.ts
import { z } from 'zod';

/**
 * User validation schemas
 */
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: phoneSchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: phoneSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  language: z.enum(['en', 'am']).optional(),
});

/**
 * Listing validation schemas
 */
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  country: z.string().min(1, 'Country is required'),
  zipCode: z.string().min(1, 'ZIP/Postal code is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const pricingSchema = z.object({
  basePrice: z.number().positive('Base price must be positive'),
  currency: z.string().default('USD'),
  cleaningFee: z.number().nonnegative().optional(),
  serviceFee: z.number().nonnegative().optional(),
  weeklyDiscount: z.number().min(0).max(100).optional(),
  monthlyDiscount: z.number().min(0).max(100).optional(),
});

export const listingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  propertyType: z.enum(['house', 'apartment', 'guesthouse', 'hotel']),
  address: addressSchema,
  pricing: pricingSchema,
  maxGuests: z.number().int().positive(),
  bedrooms: z.number().int().nonnegative(),
  beds: z.number().int().positive(),
  bathrooms: z.number().positive(),
  amenities: z.array(z.string()).min(1, 'At least one amenity is required'),
  images: z.array(z.string().url()).min(3, 'At least 3 images are required'),
  houseRules: z.array(z.string()).optional(),
  checkInTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  checkOutTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  minimumStay: z.number().int().positive().default(1),
  maximumStay: z.number().int().positive().optional(),
});

/**
 * Booking validation schemas
 */
export const bookingSchema = z.object({
  listingId: z.string().min(1),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().int().positive(),
  totalPrice: z.number().positive(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
});

/**
 * Message validation schemas
 */
export const messageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty').max(1000, 'Message is too long'),
});

export const searchSchema = z.object({
  location: z.string().optional(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  guests: z.number().int().positive().optional(),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().positive().optional(),
  propertyType: z.enum(['house', 'apartment', 'guesthouse', 'hotel']).optional(),
}).refine((data) => {
  if (data.checkIn && data.checkOut) {
    return data.checkOut > data.checkIn;
  }
  return true;
}, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type SearchInput = z.infer<typeof searchSchema>;