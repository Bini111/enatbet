/**
 * Validation Utilities
 */

import { z } from 'zod';

/**
 * Email validation
 */
export const emailSchema = z.string().email('Invalid email address');

export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

/**
 * Phone number validation (international format)
 */
export const phoneSchema = z.string().regex(
  /^\+?[1-9]\d{1,14}$/,
  'Invalid phone number format'
);

export function isValidPhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}

/**
 * Password validation
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export function isValidPassword(password: string): boolean {
  return passwordSchema.safeParse(password).success;
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
}

/**
 * URL validation
 */
export const urlSchema = z.string().url('Invalid URL');

export function isValidUrl(url: string): boolean {
  return urlSchema.safeParse(url).success;
}

/**
 * Price validation
 */
export const priceSchema = z.number().positive('Price must be positive');

export function isValidPrice(price: number): boolean {
  return priceSchema.safeParse(price).success;
}

/**
 * Date range validation
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return endDate > startDate;
}

/**
 * Guest count validation
 */
export function isValidGuestCount(
  adults: number,
  children: number = 0,
  infants: number = 0,
  maxGuests: number
): boolean {
  const total = adults + children;
  return adults > 0 && total <= maxGuests && total > 0;
}

/**
 * Booking validation schema
 */
export const bookingRequestSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.object({
    adults: z.number().min(1, 'At least one adult required'),
    children: z.number().min(0),
    infants: z.number().min(0),
    pets: z.number().min(0),
  }),
  specialRequests: z.string().max(500, 'Special requests too long').optional(),
});

/**
 * Listing validation schema
 */
export const listingSchema = z.object({
  title: z.string().min(10, 'Title too short').max(100, 'Title too long'),
  description: z.string().min(50, 'Description too short').max(5000, 'Description too long'),
  propertyType: z.enum(['apartment', 'house', 'villa', 'condo', 'guesthouse', 'hotel', 'hostel']),
  roomType: z.enum(['entire_place', 'private_room', 'shared_room']),
  pricing: z.object({
    basePrice: z.number().positive('Base price must be positive'),
    cleaningFee: z.number().min(0, 'Cleaning fee cannot be negative'),
    currency: z.string().length(3, 'Invalid currency code'),
  }),
  capacity: z.object({
    maxGuests: z.number().min(1, 'At least 1 guest required'),
    bedrooms: z.number().min(0),
    beds: z.number().min(1, 'At least 1 bed required'),
    bathrooms: z.number().min(0.5, 'At least half bathroom required'),
  }),
  location: z.object({
    address: z.string().min(1, 'Address required'),
    city: z.string().min(1, 'City required'),
    country: z.string().min(1, 'Country required'),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  }),
});

/**
 * Review validation schema
 */
export const reviewSchema = z.object({
  ratings: z.object({
    overall: z.number().min(1).max(5),
    cleanliness: z.number().min(1).max(5),
    accuracy: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    location: z.number().min(1).max(5),
    value: z.number().min(1).max(5),
  }),
  comment: z.string().min(20, 'Review too short').max(2000, 'Review too long'),
});

/**
 * User profile validation schema
 */
export const userProfileSchema = z.object({
  displayName: z.string().min(2, 'Name too short').max(50, 'Name too long'),
  bio: z.string().max(500, 'Bio too long').optional(),
  phoneNumber: phoneSchema.optional(),
  dateOfBirth: z.date().max(new Date(), 'Invalid date of birth').optional(),
});

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate file upload
 */
export function isValidImageFile(
  file: File,
  maxSize: number = 5 * 1024 * 1024 // 5MB default
): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and HEIC allowed' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` };
  }

  return { valid: true };
}

/**
 * Validate coordinate bounds
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Check if string contains profanity (basic check)
 */
const profanityList = ['badword1', 'badword2']; // Add actual words as needed

export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word));
}

/**
 * Validate promo code format
 */
export function isValidPromoCode(code: string): boolean {
  return /^[A-Z0-9]{4,20}$/.test(code);
}
