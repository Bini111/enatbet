'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { SERVICE_FEE_RATE } from '@enatbet/config';
import debounce from 'lodash/debounce';

type Props = {
  listingId: string;
  nightlyPrice: number;
  title: string;
  maxGuests?: number;
};

export default function BookingForm({ 
  listingId, 
  nightlyPrice, 
  title,
  maxGuests = 10 
}: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const tomorrow = startOfDay(addDays(new Date(), 1));
  const dayAfter = startOfDay(addDays(new Date(), 2));
  
  const [checkIn, setCheckIn] = useState(format(tomorrow, 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(dayAfter, 'yyyy-MM-dd'));
  const [guests, setGuests] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const nights = useMemo(() => {
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    const diff = differenceInCalendarDays(end, start);
    return Math.max(1, diff);
  }, [checkIn, checkOut]);

  const subtotal = nights * nightlyPrice;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const displayTotal = subtotal + serviceFee;

  const debouncedReserve = useMemo(
    () => debounce(async () => {
      if (!user) {
        toast.error('Please sign in to make a reservation');
        router.push('/auth/signin?redirect=' + encodeURIComponent(window.location.pathname));
        setIsLoading(false);
        return;
      }

      const start = startOfDay(parseISO(checkIn));
      const end = startOfDay(parseISO(checkOut));
      const today = startOfDay(new Date());
      
      if (start >= end) {
        toast.error('Check-out must be after check-in');
        setIsLoading(false);
        return;
      }

      if (start <= today) {
        toast.error('Check-in date must be in the future');
        setIsLoading(false);
        return;
      }

      if (guests > maxGuests || guests < 1) {
        toast.error(`Guests must be between 1 and ${maxGuests}`);
        setIsLoading(false);
        return;
      }

      toast.loading('Redirecting to checkout...');
      
      const params = new URLSearchParams({
        listingId,
        checkIn,
        checkOut,
        guests: String(guests),
        title,
      });

      router.push(`/checkout?${params.toString()}`);
    }, 300),
    [user, checkIn, checkOut, guests, maxGuests, listingId, title, router]
  );

  const handleReserve = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    debouncedReserve();
  }, [isLoading, debouncedReserve]);

  useEffect(() => {
    return () => {
      debouncedReserve.cancel();
    };
  }, [debouncedReserve]);

  const tomorrow_str = format(tomorrow, 'yyyy-MM-dd');
  const minCheckOut = checkIn ? format(addDays(parseISO(checkIn), 1), 'yyyy-MM-dd') : tomorrow_str;

  return (
    <div className="rounded-xl border shadow-lg p-6 bg-white">
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            ${Math.floor(nightlyPrice / 100)}
          </span>
          <span className="text-gray-600">night</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-0 border rounded-lg overflow-hidden">
          <div className="p-3 border-r">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              CHECK-IN
            </label>
            <input
              type="date"
              value={checkIn}
              min={tomorrow_str}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full text-sm outline-none"
              disabled={isLoading}
            />
          </div>
          <div className="p-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              CHECK-OUT
            </label>
            <input
              type="date"
              value={checkOut}
              min={minCheckOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full text-sm outline-none"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="border rounded-lg p-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            GUESTS
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full text-sm outline-none"
            disabled={isLoading}
          >
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'guest' : 'guests'}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleReserve}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg py-3 font-semibold hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Reserve'}
        </button>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="underline">
              ${Math.floor(nightlyPrice / 100)} x {nights} {nights === 1 ? 'night' : 'nights'}
            </span>
            <span>${(subtotal / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="underline">Service fee</span>
            <span>${(serviceFee / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Total</span>
            <span>${(displayTotal / 100).toFixed(2)}</span>
          </div>
        </div>

        <p className="text-xs text-center text-gray-500">
          You won't be charged yet
        </p>
      </div>
    </div>
  );
}
