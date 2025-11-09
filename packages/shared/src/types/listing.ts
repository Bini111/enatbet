import type { CurrencyCode } from '../constants/currencies';

export interface Listing {
  id: string;
  hostId: string;
  title: string;
  description: string;
  pricePerNight: number; // major units
  currency: CurrencyCode;
  city?: string;
  country?: string;
  photos?: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type ListingCreate = Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>;
