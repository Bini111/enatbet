import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, collections, getErrorMessage } from '../config/firebase';
import { Booking, BookingFormData, Listing, User } from '../types';
import listingService from './listing.service';
import notificationService from './notification.service';

class BookingService {
  // Create a booking request
  async createBooking(data: BookingFormData, guestId: string): Promise<string> {
    try {
      // Get listing details
      const listing = await listingService.getListingById(data.listingId);
      
      if (!listing) {
        throw new Error('Listing not found');
      }

      // Check availability
      const isAvailable = await listingService.checkAvailability(
        data.listingId,
        data.checkIn,
        data.checkOut
      );

      if (!isAvailable) {
        throw new Error('These dates are not available');
      }

      // Calculate pricing
      const nights = Math.ceil(
        (data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const subtotal = listing.pricing.nightly * nights;
      const cleaningFee = listing.pricing.cleaning;
      const hostServiceFee = subtotal * 0.03; // 3%
      const guestServiceFee = subtotal * 0.14; // 14%
      const total = subtotal + cleaningFee + guestServiceFee;

      // Create booking document
      const bookingRef = doc(collection(db, collections.bookings));
      
      const booking = {
        listingId: data.listingId,
        hostId: listing.hostId,
        guestId,
        checkIn: Timestamp.fromDate(data.checkIn),
        checkOut: Timestamp.fromDate(data.checkOut),
        guests: data.guests,
        pricing: {
          nightly: listing.pricing.nightly,
          nights,
          subtotal,
          cleaningFee,
          hostServiceFee,
          guestServiceFee,
          total,
          currency: listing.pricing.currency,
        },
        status: listing.availability.instantBook ? 'confirmed' : 'pending',
        specialRequests: data.specialRequests || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(bookingRef, booking);

      // Send notification to host
      await notificationService.sendNotification(
        listing.hostId,
        'booking_request',
        'New Booking Request',
        `You have a new booking request for ${listing.title}`,
        {
          bookingId: bookingRef.id,
          listingId: data.listingId,
        }
      );

      return bookingRef.id;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Get booking by ID
  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const bookingDoc = await getDoc(doc(db, collections.bookings, bookingId));
      
      if (!bookingDoc.exists()) {
        return null;
      }

      const booking = { id: bookingDoc.id, ...bookingDoc.data() } as Booking;

      // Fetch related data
      if (booking.listingId) {
        booking.listing = await listingService.getListingById(booking.listingId);
      }

      if (booking.hostId) {
        const hostDoc = await getDoc(doc(db, collections.users, booking.hostId));
        if (hostDoc.exists()) {
          booking.host = { id: hostDoc.id, ...hostDoc.data() } as User;
        }
      }

      if (booking.guestId) {
        const guestDoc = await getDoc(doc(db, collections.users, booking.guestId));
        if (guestDoc.exists()) {
          booking.guest = { id: guestDoc.id, ...guestDoc.data() } as User;
        }
      }

      return booking;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Get bookings for a user (as guest)
  async getGuestBookings(guestId: string, status?: string): Promise<Booking[]> {
    try {
      let q = query(
        collection(db, collections.bookings),
        where('guestId', '==', guestId),
        orderBy('checkIn', 'desc')
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const querySnapshot = await getDocs(q);
      const bookings: Booking[] = [];

      for (const doc of querySnapshot.docs) {
        const booking = { id: doc.id, ...doc.data() } as Booking;
        
        // Fetch listing details
        if (booking.listingId) {
          booking.listing = await listingService.getListingById(booking.listingId);
        }
        
        bookings.push(booking);
      }

      return bookings;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Get bookings for a host
  async getHostBookings(hostId: string, status?: string): Promise<Booking[]> {
    try {
      let q = query(
        collection(db, collections.bookings),
        where('hostId', '==', hostId),
        orderBy('checkIn', 'desc')
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const querySnapshot = await getDocs(q);
      const bookings: Booking[] = [];

      for (const doc of querySnapshot.docs) {
        const booking = { id: doc.id, ...doc.data() } as Booking;
        
        // Fetch guest details
        if (booking.guestId) {
          const guestDoc = await getDoc(doc(db, collections.users, booking.guestId));
          if (guestDoc.exists()) {
            booking.guest = { id: guestDoc.id, ...guestDoc.data() } as User;
          }
        }
        
        // Fetch listing details
        if (booking.listingId) {
          booking.listing = await listingService.getListingById(booking.listingId);
        }
        
        bookings.push(booking);
      }

      return bookings;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Accept booking (host action)
  async acceptBooking(bookingId: string): Promise<void> {
    try {
      await updateDoc(doc(db, collections.bookings, bookingId), {
        status: 'confirmed',
        updatedAt: serverTimestamp(),
      });

      // Get booking details for notification
      const booking = await this.getBookingById(bookingId);
      
      if (booking) {
        // Send notification to guest
        await notificationService.sendNotification(
          booking.guestId,
          'booking_confirmed',
          'Booking Confirmed!',
          `Your booking has been confirmed by the host`,
          {
            bookingId,
            listingId: booking.listingId,
          }
        );
      }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Decline booking (host action)
  async declineBooking(bookingId: string, reason?: string): Promise<void> {
    try {
      await updateDoc(doc(db, collections.bookings, bookingId), {
        status: 'cancelled',
        cancellationReason: reason || 'Declined by host',
        updatedAt: serverTimestamp(),
      });

      // Get booking details for notification
      const booking = await this.getBookingById(bookingId);
      
      if (booking) {
        // Send notification to guest
        await notificationService.sendNotification(
          booking.guestId,
          'booking_cancelled',
          'Booking Declined',
          `Unfortunately, your booking request was declined`,
          {
            bookingId,
            listingId: booking.listingId,
          }
        );
      }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Cancel booking (guest or host)
  async cancelBooking(bookingId: string, userId: string, reason: string): Promise<void> {
    try {
      const booking = await this.getBookingById(bookingId);
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check if user is authorized to cancel
      if (booking.guestId !== userId && booking.hostId !== userId) {
        throw new Error('You are not authorized to cancel this booking');
      }

      // Update booking status
      await updateDoc(doc(db, collections.bookings, bookingId), {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledBy: userId,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Send notifications
      const recipientId = booking.guestId === userId ? booking.hostId : booking.guestId;
      const cancelledByRole = booking.guestId === userId ? 'guest' : 'host';
      
      await notificationService.sendNotification(
        recipientId,
        'booking_cancelled',
        'Booking Cancelled',
        `The booking has been cancelled by the ${cancelledByRole}`,
        {
          bookingId,
          listingId: booking.listingId,
        }
      );

      // Handle refund if applicable (would call Stripe API)
      if (booking.paymentIntentId) {
        await this.processRefund(booking.paymentIntentId, booking.pricing.total);
      }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Create payment intent
  async createPaymentIntent(bookingId: string): Promise<{ clientSecret: string }> {
    try {
      const createPaymentIntentFn = httpsCallable(functions, 'createPaymentIntent');
      const result = await createPaymentIntentFn({ bookingId });
      return result.data as { clientSecret: string };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Process refund (would integrate with Stripe)
  private async processRefund(paymentIntentId: string, amount: number): Promise<void> {
    try {
      // This would call a Firebase Function to process Stripe refund
      const processRefundFn = httpsCallable(functions, 'processRefund');
      await processRefundFn({ paymentIntentId, amount });
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  }

  // Get upcoming bookings for a listing
  async getUpcomingBookings(listingId: string): Promise<Booking[]> {
    try {
      const now = new Date();
      
      const q = query(
        collection(db, collections.bookings),
        where('listingId', '==', listingId),
        where('status', '==', 'confirmed'),
        where('checkIn', '>=', Timestamp.fromDate(now)),
        orderBy('checkIn', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const bookings: Booking[] = [];

      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() } as Booking);
      });

      return bookings;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Calculate host earnings
  async calculateHostEarnings(hostId: string): Promise<{
    total: number;
    pending: number;
    upcoming: number;
  }> {
    try {
      const bookings = await this.getHostBookings(hostId);
      
      let total = 0;
      let pending = 0;
      let upcoming = 0;
      const now = new Date();

      bookings.forEach((booking) => {
        const earnings = booking.pricing.subtotal - booking.pricing.hostServiceFee;
        
        if (booking.status === 'completed') {
          total += earnings;
        } else if (booking.status === 'confirmed') {
          if (booking.checkIn.getTime() > now.getTime()) {
            upcoming += earnings;
          } else {
            pending += earnings;
          }
        }
      });

      return { total, pending, upcoming };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Mark booking as completed (after checkout)
  async completeBooking(bookingId: string): Promise<void> {
    try {
      await updateDoc(doc(db, collections.bookings, bookingId), {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Get booking details
      const booking = await this.getBookingById(bookingId);
      
      if (booking) {
        // Send review reminders to both parties
        await notificationService.sendNotification(
          booking.guestId,
          'new_review',
          'Leave a Review',
          `How was your stay at ${booking.listing?.title}?`,
          {
            bookingId,
            listingId: booking.listingId,
          }
        );

        await notificationService.sendNotification(
          booking.hostId,
          'new_review',
          'Review Your Guest',
          `How was your experience hosting ${booking.guest?.displayName}?`,
          {
            bookingId,
            guestId: booking.guestId,
          }
        );
      }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export default new BookingService();