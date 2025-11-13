'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, calculateNights } from '@enatebet/shared';
import type { Listing } from '@enatebet/shared';

interface BookingWidgetProps {
  listing: Listing;
}

export function BookingWidget({ listing }: BookingWidgetProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const nights = checkIn && checkOut ? calculateNights(new Date(checkIn), new Date(checkOut)) : 0;
  const totalGuests = adults + children;

  // Calculate pricing
  const subtotal = nights * listing.pricing.basePrice;
  const cleaningFee = listing.pricing.cleaningFee;
  const serviceFee = Math.round(subtotal * 0.15); // 15% service fee
  const total = subtotal + cleaningFee + serviceFee;

  const canBook =
    checkIn &&
    checkOut &&
    nights > 0 &&
    totalGuests > 0 &&
    totalGuests <= listing.rules.maxGuests &&
    nights >= listing.availability.minNights &&
    nights <= listing.availability.maxNights;

  const handleBooking = () => {
    if (!canBook) return;

    const params = new URLSearchParams({
      listingId: listing.id,
      checkIn,
      checkOut,
      adults: adults.toString(),
      children: children.toString(),
    });

    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="border border-gray-300 rounded-lg shadow-lg p-6 sticky top-24">
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">
            {listing.roomType === 'free_stay'
              ? 'Free'
              : formatCurrency(listing.pricing.basePrice, listing.pricing.currency)}
          </span>
          {listing.roomType !== 'free_stay' && (
            <span className="text-gray-600">/ night</span>
          )}
        </div>
        {listing.stats.rating > 0 && (
          <div className="flex items-center gap-2 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <span className="font-medium">{listing.stats.rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-500">({listing.stats.reviewCount} reviews)</span>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-600 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-600 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Adults</label>
              <input
                type="number"
                min="1"
                max={listing.rules.maxGuests}
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Children</label>
              <input
                type="number"
                min="0"
                max={listing.rules.maxGuests - adults}
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Maximum {listing.rules.maxGuests} guests
          </p>
        </div>
      </div>

      {checkIn && checkOut && nights > 0 && listing.roomType !== 'free_stay' && (
        <div className="border-t border-gray-200 pt-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">
              {formatCurrency(listing.pricing.basePrice, listing.pricing.currency)} x {nights} nights
            </span>
            <span className="font-medium">
              {formatCurrency(subtotal, listing.pricing.currency)}
            </span>
          </div>
          {cleaningFee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Cleaning fee</span>
              <span className="font-medium">
                {formatCurrency(cleaningFee, listing.pricing.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Service fee</span>
            <span className="font-medium">
              {formatCurrency(serviceFee, listing.pricing.currency)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total, listing.pricing.currency)}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleBooking}
        disabled={!canBook}
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
          canBook
            ? 'bg-pink-600 text-white hover:bg-pink-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {listing.roomType === 'free_stay' ? 'Request to Stay' : 'Reserve'}
      </button>

      {!canBook && checkIn && checkOut && (
        <p className="text-sm text-red-600 mt-2 text-center">
          {nights < listing.availability.minNights && `Minimum ${listing.availability.minNights} nights required`}
          {nights > listing.availability.maxNights && `Maximum ${listing.availability.maxNights} nights allowed`}
          {totalGuests > listing.rules.maxGuests && `Maximum ${listing.rules.maxGuests} guests allowed`}
        </p>
      )}

      <p className="text-xs text-gray-500 text-center mt-3">
        You won't be charged yet
      </p>
    </div>
  );
}
