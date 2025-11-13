import { create } from 'zustand';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  checkAvailability,
} from '@enatebet/firebase';
import { MoneyUtils, calculateNights } from '@enatebet/shared';
import type { Booking, BookingCreate, SupportedCurrency } from '@enatebet/shared';

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  error: string | null;

  fetchUserBookings: (userId: string) => Promise<void>;
  createNewBooking: (
    guestId: string,
    bookingData: BookingCreate,
    basePrice: number,
    cleaningFee: number,
    currency: SupportedCurrency
  ) => Promise<string>;
  getBooking: (bookingId: string) => Promise<void>;
  cancelBookingById: (bookingId: string, reason: string) => Promise<void>;
  checkIfAvailable: (listingId: string, checkIn: Date, checkOut: Date) => Promise<boolean>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null,

  fetchUserBookings: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const bookings = await getUserBookings(userId);
      set({ bookings, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createNewBooking: async (guestId, bookingData, basePrice, cleaningFee, currency) => {
    set({ isLoading: true, error: null });
    try {
      // Calculate pricing
      const nights = calculateNights(bookingData.checkIn, bookingData.checkOut);
      const pricing = MoneyUtils.calculateBookingTotal({
        basePrice,
        nights,
        cleaningFee,
        currency,
      });

      // Create booking
      const bookingId = await createBooking(guestId, bookingData, pricing);
      set({ isLoading: false });
      return bookingId;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getBooking: async (bookingId: string) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await getBookingById(bookingId);
      set({ currentBooking: booking, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  cancelBookingById: async (bookingId: string, reason: string) => {
    set({ isLoading: true, error: null });
    try {
      await cancelBooking(bookingId, reason, 'guest');
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  checkIfAvailable: async (listingId: string, checkIn: Date, checkOut: Date) => {
    try {
      const isAvailable = await checkAvailability(listingId, checkIn, checkOut);
      return isAvailable;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },
}));
