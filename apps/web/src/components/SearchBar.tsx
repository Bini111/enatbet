'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests.toString());

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-full shadow-lg border border-gray-200 p-2 flex items-center gap-2 max-w-4xl mx-auto"
    >
      <div className="flex-1 px-4">
        <label className="block text-xs font-semibold text-gray-700">Where</label>
        <input
          type="text"
          placeholder="Search destinations"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
        />
      </div>

      <div className="h-8 w-px bg-gray-300" />

      <div className="flex-1 px-4">
        <label className="block text-xs font-semibold text-gray-700">Check in</label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-full text-sm text-gray-900 focus:outline-none"
        />
      </div>

      <div className="h-8 w-px bg-gray-300" />

      <div className="flex-1 px-4">
        <label className="block text-xs font-semibold text-gray-700">Check out</label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-full text-sm text-gray-900 focus:outline-none"
        />
      </div>

      <div className="h-8 w-px bg-gray-300" />

      <div className="flex-1 px-4">
        <label className="block text-xs font-semibold text-gray-700">Guests</label>
        <input
          type="number"
          min="1"
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value))}
          className="w-full text-sm text-gray-900 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="bg-pink-600 hover:bg-pink-700 text-white rounded-full p-3 transition-colors"
        aria-label="Search"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </form>
  );
}
