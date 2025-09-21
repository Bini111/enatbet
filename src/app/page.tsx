"use client";

import Image from "next/image";
import { useState } from "react";

export default function HomePage() {
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleSearch = () => {
    alert(
      `Searching for ${guests} guest(s) in ${location} from ${checkIn} to ${checkOut}`
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 shadow-md">
        <div className="flex items-center space-x-2">
          <Image src="/Logo.png" alt="EnatBet Logo" width={40} height={40} />
          <h1 className="font-bold text-xl">EnatBet</h1>
        </div>
        <div className="flex space-x-4">
          <button className="px-4 py-2 text-sm font-medium hover:underline">
            Login
          </button>
          <button className="px-4 py-2 bg-black text-white rounded-full text-sm">
            Become a Host
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gray-100 py-12 px-6 flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Find a home that feels like family
        </h2>
        <div className="bg-white shadow-md rounded-full flex flex-wrap items-center gap-4 px-6 py-4 w-full max-w-4xl">
          <input
            type="text"
            placeholder="Where are you going?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 border-none focus:outline-none"
          />
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="border-none focus:outline-none"
          />
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="border-none focus:outline-none"
          />
          <input
            type="number"
            min="1"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-16 border-none focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-black text-white px-4 py-2 rounded-full"
          >
            Search
          </button>
        </div>
      </header>

      {/* Dummy Listings */}
      <main className="flex-1 px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg shadow-md overflow-hidden">
            <Image
              src={`/house${i}.jpg`}
              alt={`House ${i}`}
              width={400}
              height={250}
              className="object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg">Sample Home {i}</h3>
              <p className="text-gray-600">$75/night</p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
