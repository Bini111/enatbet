import { create } from 'zustand';
import { Booking } from '../types';

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<string>;
  fetchUserBookings: (userId: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  isLoading: false,
  error: null,

  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null });
    try {
      // Mock booking creation
      const bookingId = Date.now().toString();
      const newBooking: Booking = {
        id: bookingId,
        ...bookingData,
        createdAt: new Date(),
      };
      
      set((state) => ({
        bookings: [...state.bookings, newBooking],
        isLoading: false,
      }));
      
      return bookingId;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchUserBookings: async (userId: string) => {
    set({ isLoading: true, error: null });
    // Mock fetch
    setTimeout(() => {
      set({ isLoading: false });
    }, 500);
  },
}));
