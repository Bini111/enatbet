import { create } from 'zustand';
import { Booking, CreateBookingInput } from '@enatbet/shared';
import {
  getUserBookings,
  getHostBookings,
  getBookingById,
  createBooking,
  cancelBooking,
} from '@enatbet/firebase';

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUserBookings: (userId: string) => Promise<void>;
  fetchHostBookings: (hostId: string) => Promise<void>;
  fetchBookingById: (id: string) => Promise<void>;
  createBooking: (guestId: string, booking: CreateBookingInput, pricing: any) => Promise<string>;
  cancelBooking: (bookingId: string, reason: string, cancelledBy: 'guest' | 'host') => Promise<void>;
  clearError: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  selectedBooking: null,
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

  fetchHostBookings: async (hostId: string) => {
    set({ isLoading: true, error: null });
    try {
      const bookings = await getHostBookings(hostId);
      set({ bookings, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchBookingById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await getBookingById(id);
      set({ selectedBooking: booking, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createBooking: async (guestId: string, booking: CreateBookingInput, pricing: any) => {
    set({ isLoading: true, error: null });
    try {
      const bookingId = await createBooking(guestId, booking, pricing);
      set({ isLoading: false });
      return bookingId;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  cancelBooking: async (bookingId: string, reason: string, cancelledBy: 'guest' | 'host') => {
    set({ isLoading: true, error: null });
    try {
      await cancelBooking(bookingId, reason, cancelledBy);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
