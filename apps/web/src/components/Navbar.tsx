'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export default function Navbar() {
  const { user, signOutUser } = useAuthStore();

  const handleSignOut = async () => {
    await signOutUser();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🇪🇹</span>
              <span className="text-2xl font-bold text-pink-600">ENATBET</span>
              <span className="text-2xl">🇪🇷</span>
            </Link>
            <p className="ml-4 text-xs text-gray-500 hidden lg:block italic">
              Book a home, not just a room
            </p>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/properties" className="text-gray-700 hover:text-pink-600">
              Properties
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-pink-600">
              About
            </Link>
            
            {user ? (
              <>
                <Link href="/profile" className="text-gray-700 hover:text-pink-600">
                  {user.displayName || 'Profile'}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-pink-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-pink-600">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
