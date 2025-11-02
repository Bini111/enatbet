import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Booking, BookingCreate, BookingPricing, Listing } from '@enatebet/shared';
import { calculateBookingPrice } from '@enatebet/shared';

/**
 * Booking Service
 * Handles booking creation, payments, and management
 */

// Convert Firestore document to Booking
const convertToBooking = (docId: string, data: any): Booking => {
  return {
    id: docId,
    listingId: data.listingId,
    guestId: data.guestId,
    hostId: data.hostId,
    checkIn: data.checkIn.toDate(),
    checkOut: data.checkOut.toDate(),
    guests: data.guests,
    pricing: data.pricing,
    status: data.status,
    payment: {
      method: data.payment.method,
      status: data.payment.status,
      stripePaymentIntentId: data.payment.stripePaymentIntentId,
      paidAt: data.payment.paidAt?.toDate(),
    },
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};

// Create booking (without payment - payment handled separately)
export const createBooking = async (
  guestId: string,
  bookingData: BookingCreate,
  pricing: BookingPricing
): Promise<string> => {
  try {
    // Get listing to get hostId
    const listingDoc = await getDoc(doc(db, 'listings', bookingData.listingId));
    if (!listingDoc.exists()) {
      throw new Error('Listing not found');
    }

    const listing = listingDoc.data() as Listing;

    // Create booking document
    const docData = {
      listingId: bookingData.listingId,
      guestId,
      hostId: listing.hostId,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      pricing,
      status: 'pending',
      payment: {
        method: 'stripe',
        status: 'pending',
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'bookings'), docData);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create booking');
  }
};

// Update booking status after payment
export const updateBookingAfterPayment = async (
  bookingId: string,
  stripePaymentIntentId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'confirmed',
      'payment.status': 'completed',
      'payment.stripePaymentIntentId': stripePaymentIntentId,
      'payment.paidAt': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update listing stats
    const booking = await getBookingById(bookingId);
    if (booking) {
      const listingRef = doc(db, 'listings', booking.listingId);
      const listingDoc = await getDoc(listingRef);
      if (listingDoc.exists()) {
        const currentBookings = listingDoc.data().stats?.bookings || 0;
        await updateDoc(listingRef, {
          'stats.bookings': currentBookings + 1,
        });
      }
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update booking');
  }
};

// Get booking by ID
export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'bookings', bookingId));
    if (!docSnap.exists()) return null;
    return convertToBooking(docSnap.id, docSnap.data());
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get booking');
  }
};

// Get user bookings (as guest)
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('guestId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertToBooking(doc.id, doc.data()));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get bookings');
  }
};

// Get host bookings (bookings for host's listings)
export const getHostBookings = async (hostId: string): Promise<Booking[]> => {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('hostId', '==', hostId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertToBooking(doc.id, doc.data()));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get host bookings');
  }
};

// Cancel booking
export const cancelBooking = async (
  bookingId: string,
  reason: string,
  cancelledBy: 'guest' | 'host'
): Promise<void> => {
  try {
    const booking = await getBookingById(bookingId);
    if (!booking) throw new Error('Booking not found');

    // Calculate refund amount (simple: full refund if >24h before checkin)
    const now = new Date();
    const hoursUntilCheckin = (booking.checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);
    const refundAmount = hoursUntilCheckin > 24 ? booking.pricing.total : 0;

    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'cancelled',
      cancellation: {
        reason,
        cancelledBy,
        cancelledAt: serverTimestamp(),
        refundAmount,
        refundStatus: refundAmount > 0 ? 'pending' : 'completed',
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to cancel booking');
  }
};

// Check if dates are available
export const checkAvailability = async (
  listingId: string,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> => {
  try {
    // Get all confirmed bookings for this listing
    const q = query(
      collection(db, 'bookings'),
      where('listingId', '==', listingId),
      where('status', 'in', ['confirmed', 'pending', 'checked_in'])
    );

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => convertToBooking(doc.id, doc.data()));

    // Check if any booking overlaps with requested dates
    for (const booking of bookings) {
      const hasOverlap = 
        (checkIn >= booking.checkIn && checkIn < booking.checkOut) ||
        (checkOut > booking.checkIn && checkOut <= booking.checkOut) ||
        (checkIn <= booking.checkIn && checkOut >= booking.checkOut);

      if (hasOverlap) return false;
    }

    return true;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to check availability');
  }
};
