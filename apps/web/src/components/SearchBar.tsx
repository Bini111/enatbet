'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  initialLocation?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

export function SearchBar({
  initialLocation = '',
  initialCheckIn = '',
  initialCheckOut = '',
  initialGuests = 1,
}: SearchBarProps) {
  const router = useRouter();
  const [location, setLocation] = useState(initialLocation);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests > 0) params.set('guests', guests.toString());

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-lg shadow-lg p-4 flex flex-col md:flex-row gap-4 items-end"
    >
      <div className="flex-1">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Where
        </label>
        <input
          id="location"
          type="text"
          placeholder="City, state, or country"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-600 focus:border-transparent"
        />
      </div>

      <div className="flex-1">
        <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
          Check-in
        </label>
        <input
          id="checkIn"
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-600 focus:border-transparent"
        />
      </div>

      <div className="flex-1">
        <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
          Check-out
        </label>
        <input
          id="checkOut"
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          min={checkIn || undefined}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-600 focus:border-transparent"
        />
      </div>

      <div className="flex-1">
        <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
          Guests
        </label>
        <input
          id="guests"
          type="number"
          min="1"
          max="20"
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-600 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        className="bg-pink-600 text-white px-8 py-3 rounded-md hover:bg-pink-700 transition-colors font-medium whitespace-nowrap"
      >
        Search
      </button>
    </form>
  );
}
