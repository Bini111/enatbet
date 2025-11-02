import type { User, Listing, Booking, Review, Conversation, Message, Notification } from '@enatebet/shared';

/**
 * Firebase Firestore Converters
 * Type-safe serialization/deserialization for Firestore documents
 */

// Helper to convert Firestore Timestamps to Dates
const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  return new Date();
};

// Helper to convert Date arrays
const timestampArrayToDate = (timestamps: any[]): Date[] => {
  if (!Array.isArray(timestamps)) return [];
  return timestamps.map(timestampToDate);
};

// ===========================================================================
// USER CONVERTER
// ===========================================================================

export const userConverter = {
  toFirestore: (user: User): any => {
    return {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL || null,
      phoneNumber: user.phoneNumber || null,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: {
        bio: user.profile.bio || null,
        languages: user.profile.languages || [],
        verifiedId: user.profile.verifiedId,
        verifiedEmail: user.profile.verifiedEmail,
        verifiedPhone: user.profile.verifiedPhone,
        hostingSince: user.profile.hostingSince || null,
        responseRate: user.profile.responseRate || null,
        responseTime: user.profile.responseTime || null,
      },
    };
  },
  fromFirestore: (snapshot: any): User => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL || undefined,
      phoneNumber: data.phoneNumber || undefined,
      role: data.role,
      status: data.status,
      emailVerified: data.emailVerified,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
      profile: {
        bio: data.profile.bio || undefined,
        languages: data.profile.languages || [],
        verifiedId: data.profile.verifiedId,
        verifiedEmail: data.profile.verifiedEmail,
        verifiedPhone: data.profile.verifiedPhone,
        hostingSince: data.profile.hostingSince ? timestampToDate(data.profile.hostingSince) : undefined,
        responseRate: data.profile.responseRate || undefined,
        responseTime: data.profile.responseTime || undefined,
      },
    };
  },
};

// ===========================================================================
// LISTING CONVERTER
// ===========================================================================

export const listingConverter = {
  toFirestore: (listing: Listing): any => {
    return {
      hostId: listing.hostId,
      title: listing.title,
      description: listing.description,
      propertyType: listing.propertyType,
      roomType: listing.roomType,
      location: listing.location,
      amenities: listing.amenities,
      images: listing.images,
      pricing: listing.pricing,
      capacity: listing.capacity,
      rules: listing.rules,
      availability: {
        blockedDates: listing.availability.blockedDates,
        availableFrom: listing.availability.availableFrom || null,
        availableTo: listing.availability.availableTo || null,
      },
      status: listing.status,
      stats: listing.stats,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  },
  fromFirestore: (snapshot: any): Listing => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      hostId: data.hostId,
      title: data.title,
      description: data.description,
      propertyType: data.propertyType,
      roomType: data.roomType,
      location: data.location,
      amenities: data.amenities,
      images: data.images,
      pricing: data.pricing,
      capacity: data.capacity,
      rules: data.rules,
      availability: {
        blockedDates: timestampArrayToDate(data.availability.blockedDates || []),
        availableFrom: data.availability.availableFrom ? timestampToDate(data.availability.availableFrom) : undefined,
        availableTo: data.availability.availableTo ? timestampToDate(data.availability.availableTo) : undefined,
      },
      status: data.status,
      stats: data.stats,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    };
  },
};

// ===========================================================================
// BOOKING CONVERTER
// ===========================================================================

export const bookingConverter = {
  toFirestore: (booking: Booking): any => {
    return {
      listingId: booking.listingId,
      guestId: booking.guestId,
      hostId: booking.hostId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      pricing: booking.pricing,
      status: booking.status,
      payment: {
        method: booking.payment.method,
        status: booking.payment.status,
        stripePaymentIntentId: booking.payment.stripePaymentIntentId || null,
        stripeChargeId: booking.payment.stripeChargeId || null,
        amount: booking.payment.amount,
        currency: booking.payment.currency,
        paidAt: booking.payment.paidAt || null,
        refundedAt: booking.payment.refundedAt || null,
        refundAmount: booking.payment.refundAmount || null,
      },
      specialRequests: booking.specialRequests || null,
      cancellation: booking.cancellation || null,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  },
  fromFirestore: (snapshot: any): Booking => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      listingId: data.listingId,
      guestId: data.guestId,
      hostId: data.hostId,
      checkIn: timestampToDate(data.checkIn),
      checkOut: timestampToDate(data.checkOut),
      guests: data.guests,
      pricing: data.pricing,
      status: data.status,
      payment: {
        method: data.payment.method,
        status: data.payment.status,
        stripePaymentIntentId: data.payment.stripePaymentIntentId || undefined,
        stripeChargeId: data.payment.stripeChargeId || undefined,
        amount: data.payment.amount,
        currency: data.payment.currency,
        paidAt: data.payment.paidAt ? timestampToDate(data.payment.paidAt) : undefined,
        refundedAt: data.payment.refundedAt ? timestampToDate(data.payment.refundedAt) : undefined,
        refundAmount: data.payment.refundAmount || undefined,
      },
      specialRequests: data.specialRequests || undefined,
      cancellation: data.cancellation
        ? {
            ...data.cancellation,
            cancelledAt: timestampToDate(data.cancellation.cancelledAt),
          }
        : undefined,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    };
  },
};

// ===========================================================================
// REVIEW CONVERTER
// ===========================================================================

export const reviewConverter = {
  toFirestore: (review: Review): any => {
    return {
      bookingId: review.bookingId,
      listingId: review.listingId,
      reviewerId: review.reviewerId,
      revieweeId: review.revieweeId,
      type: review.type,
      ratings: review.ratings,
      comment: review.comment,
      photos: review.photos || [],
      response: review.response || null,
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  },
  fromFirestore: (snapshot: any): Review => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      bookingId: data.bookingId,
      listingId: data.listingId,
      reviewerId: data.reviewerId,
      revieweeId: data.revieweeId,
      type: data.type,
      ratings: data.ratings,
      comment: data.comment,
      photos: data.photos || [],
      response: data.response
        ? {
            text: data.response.text,
            createdAt: timestampToDate(data.response.createdAt),
          }
        : undefined,
      status: data.status,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    };
  },
};

// ===========================================================================
// CONVERSATION CONVERTER
// ===========================================================================

export const conversationConverter = {
  toFirestore: (conversation: Conversation): any => {
    return {
      participants: conversation.participants,
      listingId: conversation.listingId || null,
      bookingId: conversation.bookingId || null,
      lastMessage: conversation.lastMessage || null,
      unreadCount: conversation.unreadCount,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  },
  fromFirestore: (snapshot: any): Conversation => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      participants: data.participants,
      listingId: data.listingId || undefined,
      bookingId: data.bookingId || undefined,
      lastMessage: data.lastMessage || undefined,
      unreadCount: data.unreadCount,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    };
  },
};

// ===========================================================================
// MESSAGE CONVERTER
// ===========================================================================

export const messageConverter = {
  toFirestore: (message: Message): any => {
    return {
      conversationId: message.conversationId,
      senderId: message.senderId,
      text: message.text,
      type: message.type,
      metadata: message.metadata || null,
      readBy: message.readBy,
      createdAt: message.createdAt,
    };
  },
  fromFirestore: (snapshot: any): Message => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      conversationId: data.conversationId,
      senderId: data.senderId,
      text: data.text,
      type: data.type,
      metadata: data.metadata || undefined,
      readBy: data.readBy,
      createdAt: timestampToDate(data.createdAt),
    };
  },
};

// ===========================================================================
// NOTIFICATION CONVERTER
// ===========================================================================

export const notificationConverter = {
  toFirestore: (notification: Notification): any => {
    return {
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data || null,
      read: notification.read,
      createdAt: notification.createdAt,
    };
  },
  fromFirestore: (snapshot: any): Notification => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      data: data.data || undefined,
      read: data.read,
      createdAt: timestampToDate(data.createdAt),
    };
  },
};
