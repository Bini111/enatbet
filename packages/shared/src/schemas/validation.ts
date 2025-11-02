import { z } from 'zod';

/**
 * Validation Schemas - Enatebet Platform
 * Zod schemas for form validation across web and mobile
 */

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  bio: z.string().max(500).optional(),
  languages: z.array(z.string()).optional(),
});

// ============================================================================
// LISTINGS
// ============================================================================

export const createListingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  propertyType: z.enum(['apartment', 'house', 'villa', 'condo', 'guesthouse', 'other']),
  roomType: z.enum(['entire_place', 'private_room', 'shared_room', 'free_stay']),
  
  location: z.object({
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().optional(),
    country: z.string().min(2, 'Country is required'),
    zipCode: z.string().optional(),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  }),
  
  amenities: z
    .array(
      z.enum([
        'wifi',
        'kitchen',
        'parking',
        'pool',
        'gym',
        'ac',
        'heating',
        'tv',
        'washer',
        'dryer',
        'workspace',
        'fireplace',
        'balcony',
        'garden',
        'hot_tub',
        'ev_charger',
      ])
    )
    .min(1, 'Select at least one amenity'),
  
  images: z.array(z.string().url()).min(3, 'Upload at least 3 images').max(20),
  
  pricing: z.object({
    basePrice: z.number().min(0, 'Price cannot be negative'),
    currency: z.literal('USD'),
    cleaningFee: z.number().min(0).default(0),
    serviceFeePercent: z.number().min(0).max(50).default(15),
    weeklyDiscount: z.number().min(0).max(100).optional(),
    monthlyDiscount: z.number().min(0).max(100).optional(),
    acceptsTips: z.boolean().default(false),
  }),
  
  capacity: z.object({
    guests: z.number().min(1).max(50),
    bedrooms: z.number().min(0).max(20),
    beds: z.number().min(1).max(50),
    bathrooms: z.number().min(0.5).max(20),
  }),
  
  rules: z.object({
    checkInTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    checkOutTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    minNights: z.number().min(1).default(1),
    maxNights: z.number().min(1).default(365),
    instantBook: z.boolean().default(false),
    petsAllowed: z.boolean().default(false),
    smokingAllowed: z.boolean().default(false),
    partiesAllowed: z.boolean().default(false),
    customRules: z.array(z.string()).optional(),
  }),
});

export const updateListingSchema = createListingSchema.partial();

// ============================================================================
// BOOKINGS
// ============================================================================

export const createBookingSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.object({
    adults: z.number().min(1, 'At least one adult required'),
    children: z.number().min(0).default(0),
    infants: z.number().min(0).default(0),
    pets: z.number().min(0).default(0),
  }),
  specialRequests: z.string().max(500).optional(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().min(10, 'Please provide a reason (at least 10 characters)').max(500),
});

// ============================================================================
// REVIEWS
// ============================================================================

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  ratings: z.object({
    overall: z.number().min(1).max(5),
    cleanliness: z.number().min(1).max(5),
    accuracy: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    location: z.number().min(1).max(5),
    value: z.number().min(1).max(5),
  }),
  comment: z.string().min(20, 'Review must be at least 20 characters').max(2000),
  photos: z.array(z.string().url()).max(5).optional(),
});

// ============================================================================
// MESSAGING
// ============================================================================

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  text: z.string().min(1, 'Message cannot be empty').max(2000),
});

// ============================================================================
// SEARCH
// ============================================================================

export const searchSchema = z.object({
  location: z.string().optional(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  guests: z
    .object({
      adults: z.number().min(1),
      children: z.number().min(0).default(0),
      infants: z.number().min(0).default(0),
      pets: z.number().min(0).default(0),
    })
    .optional(),
  priceRange: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
    })
    .optional(),
  propertyTypes: z.array(z.enum(['apartment', 'house', 'villa', 'condo', 'guesthouse', 'other'])).optional(),
  roomTypes: z.array(z.enum(['entire_place', 'private_room', 'shared_room', 'free_stay'])).optional(),
  amenities: z
    .array(
      z.enum([
        'wifi',
        'kitchen',
        'parking',
        'pool',
        'gym',
        'ac',
        'heating',
        'tv',
        'washer',
        'dryer',
        'workspace',
        'fireplace',
        'balcony',
        'garden',
        'hot_tub',
        'ev_charger',
      ])
    )
    .optional(),
  instantBook: z.boolean().optional(),
  freePlacesOnly: z.boolean().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
