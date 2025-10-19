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
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'); // Enhanced

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  phone: phoneSchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: phoneSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  language: z.enum(['en', 'am']).optional(),
});

/**
 * Listing validation schemas
 */
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State/Province is required').max(100),
  country: z.string().min(1, 'Country is required').max(100),
  zipCode: z.string().min(1, 'ZIP/Postal code is required').max(20),
  latitude: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  longitude: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
});

export const pricingSchema = z.object({
  basePrice: z.number().positive('Base price must be positive'),
  currency: z.string().length(3, 'Currency must be 3-letter code').default('USD'),
  cleaningFee: z.number().nonnegative('Cleaning fee cannot be negative').optional(),
  serviceFee: z.number().nonnegative('Service fee cannot be negative').optional(),
  weeklyDiscount: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%').optional(),
  monthlyDiscount: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%').optional(),
});

export const listingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title too long'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000, 'Description too long'),
  propertyType: z.enum(['house', 'apartment', 'guesthouse', 'hotel']),
  address: addressSchema,
  pricing: pricingSchema,
  maxGuests: z.number().int('Must be a whole number').positive('Must have at least 1 guest').max(20, 'Maximum 20 guests'),
  bedrooms: z.number().int('Must be a whole number').nonnegative('Cannot be negative'),
  beds: z.number().int('Must be a whole number').positive('Must have at least 1 bed'),
  bathrooms: z.number().positive('Must have at least 1 bathroom'),
  amenities: z.array(z.string()).min(1, 'At least one amenity is required'),
  images: z.array(z.string().url('Invalid image URL')).min(3, 'At least 3 images are required').max(20, 'Maximum 20 images'),
  houseRules: z.array(z.string().max(200)).optional(),
  checkInTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (use HH:MM)'),
  checkOutTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (use HH:MM)'),
  minimumStay: z.number().int('Must be a whole number').positive('Must be at least 1 night').default(1),
  maximumStay: z.number().int('Must be a whole number').positive('Must be at least 1 night').optional(),
}).refine(
  (data) => {
    if (data.maximumStay) {
      return data.maximumStay >= data.minimumStay;
    }
    return true;
  },
  {
    message: 'Maximum stay must be greater than or equal to minimum stay',
    path: ['maximumStay'],
  }
);

/**
 * Booking validation schemas
 */
export const bookingSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().int('Must be a whole number').positive('Must have at least 1 guest').max(20, 'Maximum 20 guests'),
  totalPrice: z.number().positive('Total price must be positive'),
  specialRequests: z.string().max(500, 'Special requests too long (max 500 characters)').optional(),
}).refine(
  (data) => data.checkOut > data.checkIn,
  {
    message: 'Check-out must be after check-in',
    path: ['checkOut'],
  }
).refine(
  (data) => {
    // Check-in must be at least today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return data.checkIn >= today;
  },
  {
    message: 'Check-in date cannot be in the past',
    path: ['checkIn'],
  }
).refine(
  (data) => {
    // Maximum booking length of 365 days
    const maxDays = 365;
    const daysDiff = Math.ceil((data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= maxDays;
  },
  {
    message: 'Booking cannot exceed 365 days',
    path: ['checkOut'],
  }
);

// Enhanced booking input schema for form validation
export const bookingInputSchema = z.object({
  listingId: z.string().min(1, 'Listing ID required'),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().int().min(1, 'At least 1 guest required').max(20, 'Maximum 20 guests'),
  specialRequests: z.string().max(500, 'Special requests too long (max 500 characters)').optional(),
}).refine(
  (data) => data.checkOut > data.checkIn,
  { message: 'Check-out must be after check-in', path: ['checkOut'] }
);

/**
 * Message validation schemas
 */
export const messageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty').max(1000, 'Message is too long (max 1000 characters)'),
  attachmentUrl: z.string().url('Invalid attachment URL').optional(),
});

/**
 * Search validation schemas
 */
export const searchSchema = z.object({
  location: z.string().min(1, 'Location is required').optional(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  guests: z.number().int('Must be a whole number').positive('Must have at least 1 guest').max(20, 'Maximum 20 guests').optional(),
  priceMin: z.number().nonnegative('Minimum price cannot be negative').optional(),
  priceMax: z.number().positive('Maximum price must be positive').optional(),
  propertyType: z.enum(['house', 'apartment', 'guesthouse', 'hotel']).optional(),
  amenities: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.checkIn && data.checkOut) {
    return data.checkOut > data.checkIn;
  }
  return true;
}, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
}).refine((data) => {
  if (data.priceMin && data.priceMax) {
    return data.priceMax >= data.priceMin;
  }
  return true;
}, {
  message: 'Maximum price must be greater than or equal to minimum price',
  path: ['priceMax'],
});

/**
 * Review validation schemas
 */
export const reviewSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  bookingId: z.string().min(1, 'Booking ID is required'),
  rating: z.number().int('Rating must be a whole number').min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment too long (max 1000 characters)'),
  cleanliness: z.number().int().min(1).max(5).optional(),
  communication: z.number().int().min(1).max(5).optional(),
  checkIn: z.number().int().min(1).max(5).optional(),
  accuracy: z.number().int().min(1).max(5).optional(),
  location: z.number().int().min(1).max(5).optional(),
  value: z.number().int().min(1).max(5).optional(),
});

/**
 * Payment validation schemas
 */
export const paymentIntentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3-letter code').default('USD'),
});

/**
 * Cancellation validation schemas
 */
export const cancellationSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().min(10, 'Please provide a reason (at least 10 characters)').max(500, 'Reason too long (max 500 characters)'),
  refundAmount: z.number().nonnegative('Refund amount cannot be negative').optional(),
});

/**
 * Type exports for TypeScript
 */
export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type PricingInput = z.infer<typeof pricingSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type BookingFormInput = z.infer<typeof bookingInputSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type PaymentIntentInput = z.infer<typeof paymentIntentSchema>;
export type CancellationInput = z.infer<typeof cancellationSchema>;

/**
 * Validation helper function
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Get user-friendly error messages
 */
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
}