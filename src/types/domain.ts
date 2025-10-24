import { FirestoreDataConverter, Timestamp } from 'firebase/firestore';
import { z } from 'zod';

/**
 * ==========================================================
 * ✅ Runtime Validation Schemas (Zod)
 * ==========================================================
 */

// Base schemas for nested objects
export const AddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  zipCode: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const PricingSchema = z.object({
  basePrice: z.number().positive(),
  currency: z.string().length(3), // ISO 4217 currency codes
  cleaningFee: z.number().nonnegative().optional(),
  serviceFee: z.number().nonnegative().optional(),
  weeklyDiscount: z.number().min(0).max(100).optional(),
  monthlyDiscount: z.number().min(0).max(100).optional(),
});

// User schema
export const UserSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().optional(),
  photoURL: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  role: z.enum(['guest', 'host', 'admin']),
  isHost: z.boolean(),
  isVerified: z.boolean(),
  language: z.string().min(2).max(5),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Listing schema
export const ListingSchema = z.object({
  id: z.string().min(1),
  hostId: z.string().min(1),
  title: z.string().min(10).max(100),
  description: z.string().min(50).max(5000),
  propertyType: z.enum(['house', 'apartment', 'guesthouse', 'hotel']),
  address: AddressSchema,
  pricing: PricingSchema,
  maxGuests: z.number().int().positive().max(50),
  bedrooms: z.number().int().nonnegative().max(50),
  beds: z.number().int().positive().max(100),
  bathrooms: z.number().nonnegative().max(20),
  amenities: z.array(z.string()).min(1),
  images: z.array(z.string().url()).min(1).max(50),
  coverImage: z.string().url(),
  houseRules: z.array(z.string()).optional(),
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  minimumStay: z.number().int().positive().max(365),
  maximumStay: z.number().int().positive().max(365).optional(),
  isPublished: z.boolean(),
  averageRating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Booking schema
export const BookingSchema = z
  .object({
    id: z.string().min(1),
    listingId: z.string().min(1),
    guestId: z.string().min(1),
    hostId: z.string().min(1),
    checkIn: z.date(),
    checkOut: z.date(),
    guests: z.number().int().positive().max(50),
    nights: z.number().int().positive(),
    basePrice: z.number().positive(),
    cleaningFee: z.number().nonnegative(),
    serviceFee: z.number().nonnegative(),
    totalPrice: z.number().positive(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'rejected']),
    paymentId: z.string().optional(),
    cancellationReason: z.string().max(1000).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine(data => data.checkOut > data.checkIn, {
    message: 'Check-out must be after check-in',
    path: ['checkOut'],
  });

// Message schema
export const MessageSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().min(1),
  senderId: z.string().min(1),
  text: z.string().min(1).max(5000),
  read: z.boolean(),
  createdAt: z.date(),
});

// Conversation schema
export const ConversationSchema = z.object({
  id: z.string().min(1),
  conversationKey: z.string().optional(),
  participantIds: z.array(z.string()).min(2).max(10),
  participants: z.array(UserSchema),
  listingId: z.string().optional(),
  lastMessage: MessageSchema.optional(),
  unreadCount: z.record(z.string(), z.number().int().nonnegative()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Review schema
export const ReviewSchema = z.object({
  id: z.string().min(1),
  listingId: z.string().min(1),
  bookingId: z.string().min(1),
  guestId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(2000),
  hostResponse: z.string().max(2000).optional(),
  createdAt: z.date(),
});

// Payment schema
export const PaymentSchema = z.object({
  id: z.string().min(1),
  bookingId: z.string().min(1),
  userId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3),
  status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'refunded']),
  paymentMethod: z.string().min(1),
  transactionId: z.string().optional(),
  receiptUrl: z.string().url().optional(),
  errorMessage: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Search filters schema
export const SearchFiltersSchema = z
  .object({
    location: z.string().optional(),
    checkIn: z.date().optional(),
    checkOut: z.date().optional(),
    guests: z.number().int().positive().optional(),
    priceMin: z.number().nonnegative().optional(),
    priceMax: z.number().positive().optional(),
    propertyType: z.enum(['house', 'apartment', 'guesthouse', 'hotel']).optional(),
    amenities: z.array(z.string()).optional(),
  })
  .refine(
    data => {
      if (data.checkIn && data.checkOut) {
        return data.checkOut > data.checkIn;
      }
      return true;
    },
    {
      message: 'Check-out must be after check-in',
      path: ['checkOut'],
    },
  )
  .refine(
    data => {
      if (data.priceMin !== undefined && data.priceMax !== undefined) {
        return data.priceMax > data.priceMin;
      }
      return true;
    },
    {
      message: 'Maximum price must be greater than minimum price',
      path: ['priceMax'],
    },
  );

// Booking calculation schema
export const BookingCalculationSchema = z.object({
  nights: z.number().int().positive(),
  basePrice: z.number().positive(),
  cleaningFee: z.number().nonnegative(),
  serviceFee: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  totalPrice: z.number().positive(),
});

/**
 * ==========================================================
 * ✅ TypeScript Domain Types
 * ==========================================================
 */

export enum UserRole {
  GUEST = 'guest',
  HOST = 'host',
  ADMIN = 'admin',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  GUESTHOUSE = 'guesthouse',
  HOTEL = 'hotel',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// Infer TypeScript types from Zod schemas
export type Address = z.infer<typeof AddressSchema>;
export type Pricing = z.infer<typeof PricingSchema>;
export type User = z.infer<typeof UserSchema>;
export type Listing = z.infer<typeof ListingSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
export type BookingCalculation = z.infer<typeof BookingCalculationSchema>;

/**
 * ==========================================================
 * ✅ Firestore Data Converters (auto Timestamp <-> Date)
 * ==========================================================
 *
 * Usage:
 * const listingRef = doc(db, 'listings', id).withConverter(listingConverter);
 * const listingSnap = await getDoc(listingRef);
 * const listing = listingSnap.data(); // listing.createdAt is Date, not Timestamp
 */

const timestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  if (typeof timestamp === 'number') return new Date(timestamp);
  return new Date();
};

const dateToTimestamp = (date: Date): Timestamp => Timestamp.fromDate(date);

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore: (user: User) => ({
    ...user,
    createdAt: dateToTimestamp(user.createdAt),
    updatedAt: dateToTimestamp(user.updatedAt),
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    const user = {
      ...data,
      uid: snapshot.id,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    };
    return UserSchema.parse(user); // Runtime validation
  },
};

export const listingConverter: FirestoreDataConverter<Listing> = {
  toFirestore: (listing: Listing) => ({
    ...listing,
    createdAt: dateToTimestamp(listing.createdAt),
    updatedAt: dateToTimestamp(listing.updatedAt),
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    const listing = {
      ...data,
      id: snapshot.id,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    };
    return ListingSchema.parse(listing); // Runtime validation
  },
};

export const bookingConverter: FirestoreDataConverter<Booking> = {
  toFirestore: (booking: Booking) => ({
    ...booking,
    checkIn: dateToTimestamp(booking.checkIn),
    checkOut: dateToTimestamp(booking.checkOut),
    createdAt: dateToTimestamp(booking.createdAt),
    updatedAt: dateToTimestamp(booking.updatedAt),
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    const booking = {
      ...data,
      id: snapshot.id,
      checkIn: timestampToDate(data.checkIn),
      checkOut: timestampToDate(data.checkOut),
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    };
    return BookingSchema.parse(booking); // Runtime validation
  },
};

export const messageConverter: FirestoreDataConverter<Message> = {
  toFirestore: (message: Message) => ({
    ...message,
    createdAt: dateToTimestamp(message.createdAt),
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    const message = {
      ...data,
      id: snapshot.id,
      createdAt: timestampToDate(data.createdAt),
    };
    return MessageSchema.parse(message); // Runtime validation
  },
};

export const conversationConverter: FirestoreDataConverter<Conversation> = {
  toFirestore: (conversation: Conversation) => {
    // Don't store full participant objects, only IDs
    const { participants, lastMessage, ...rest } = conversation;
    return {
      ...rest,
      createdAt: dateToTimestamp(conversation.createdAt),
      updatedAt: dateToTimestamp(conversation.updatedAt),
      ...(lastMessage && {
        lastMessage: {
          ...lastMessage,
          createdAt: dateToTimestamp(lastMessage.createdAt),
        },
      }),
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    const conversation = {
      ...data,
      id: snapshot.id,
      participants: [], // Populate separately with joins
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
      ...(data.lastMessage && {
        lastMessage: {
          ...data.lastMessage,
          createdAt: timestampToDate(data.lastMessage.createdAt),
        },
      }),
    };
    // Partial validation (without participants as they're loaded separately)
    const partialSchema = ConversationSchema.omit({ participants: true });
    return partialSchema.parse(conversation) as Conversation;
  },
};

export const reviewConverter: FirestoreDataConverter<Review> = {
  toFirestore: (review: Review) => ({
    ...review,
    createdAt: dateToTimestamp(review.createdAt),
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    const review = {
      ...data,
      id: snapshot.id,
      createdAt: timestampToDate(data.createdAt),
    };
    return ReviewSchema.parse(review); // Runtime validation
  },
};

export const paymentConverter: FirestoreDataConverter<Payment> = {
  toFirestore: (payment: Payment) => ({
    ...payment,
    createdAt: dateToTimestamp(payment.createdAt),
    updatedAt: dateToTimestamp(payment.updatedAt),
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    const payment = {
      ...data,
      id: snapshot.id,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    };
    return PaymentSchema.parse(payment); // Runtime validation
  },
};

/**
 * ==========================================================
 * ✅ Validation Helper Functions
 * ==========================================================
 */

export const validateUser = (data: unknown): User => UserSchema.parse(data);
export const validateListing = (data: unknown): Listing => ListingSchema.parse(data);
export const validateBooking = (data: unknown): Booking => BookingSchema.parse(data);
export const validateMessage = (data: unknown): Message => MessageSchema.parse(data);
export const validateReview = (data: unknown): Review => ReviewSchema.parse(data);
export const validatePayment = (data: unknown): Payment => PaymentSchema.parse(data);
export const validateSearchFilters = (data: unknown): SearchFilters =>
  SearchFiltersSchema.parse(data);
export const validateBookingCalculation = (data: unknown): BookingCalculation =>
  BookingCalculationSchema.parse(data);

// Safe parsing (returns { success: boolean, data?: T, error?: ZodError })
export const safeValidateUser = (data: unknown) => UserSchema.safeParse(data);
export const safeValidateListing = (data: unknown) => ListingSchema.safeParse(data);
export const safeValidateBooking = (data: unknown) => BookingSchema.safeParse(data);
export const safeValidateMessage = (data: unknown) => MessageSchema.safeParse(data);
export const safeValidateReview = (data: unknown) => ReviewSchema.safeParse(data);
export const safeValidatePayment = (data: unknown) => PaymentSchema.safeParse(data);
export const safeValidateSearchFilters = (data: unknown) => SearchFiltersSchema.safeParse(data);
