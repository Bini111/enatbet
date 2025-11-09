export interface Booking {
  id: string;
  listingId: string;
  guestId: string;
  checkIn: string; // ISO
  checkOut: string; // ISO
  totalPriceMinor: number;
  createdAt: string;
  updatedAt: string;
}

export type BookingCreate = Omit<Booking, 'id' | 'totalPriceMinor' | 'createdAt' | 'updatedAt'>;
