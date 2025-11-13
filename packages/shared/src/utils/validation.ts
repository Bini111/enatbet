import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Phone validation (international format)
export const phoneSchema = z.string().regex(
  /^\+?[1-9]\d{1,14}$/,
  'Invalid phone number format'
).optional();

// Password validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Money validation
export const moneySchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'ETB'])
});

// Date range validation
export const dateRangeSchema = z.object({
  checkIn: z.date(),
  checkOut: z.date()
}).refine(
  (data) => data.checkOut > data.checkIn,
  'Check-out date must be after check-in date'
);

// Listing validation
export const createListingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  propertyType: z.enum(['apartment', 'house', 'villa', 'cottage', 'hotel', 'guesthouse']),
  roomType: z.enum(['entire_place', 'private_room', 'shared_room']),
  location: z.object({
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().optional(),
    country: z.string().min(2),
    zipCode: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional()
  }),
  maxGuests: z.number().int().min(1).max(16),
  bedrooms: z.number().int().min(0).max(20),
  beds: z.number().int().min(1).max(50),
  bathrooms: z.number().min(0).max(20),
  amenities: z.array(z.string()).min(1, 'At least one amenity is required'),
  pricePerNight: moneySchema,
  cleaningFee: moneySchema.optional(),
  minimumStay: z.number().int().min(1).max(365).optional(),
  instantBook: z.boolean().optional()
});

// Booking validation
export const createBookingSchema = z.object({
  listingId: z.string().uuid(),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().int().min(1),
  specialRequests: z.string().max(500).optional()
}).refine(
  (data) => data.checkOut > data.checkIn,
  'Check-out must be after check-in'
);

// Payment validation
export const createPaymentIntentSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  customerId: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// Sanitization helpers
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
};
