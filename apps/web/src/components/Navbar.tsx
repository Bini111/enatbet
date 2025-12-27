'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { Settings } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuthStore();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image 
                src="/logo.png" 
                alt="Enatbet Logo" 
                width={48} 
                height={48}
                className="rounded-lg"
              />
              <div className="hidden sm:block">
                <span className="text-2xl font-bold text-pink-600">ENATBET</span>
                <p className="text-xs text-gray-500 italic -mt-1">Book a home, not just a room!</p>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/properties" className="text-gray-700 hover:text-pink-600 transition-colors">
              Properties
            </Link>
            <Link href="/become-a-host" className="text-gray-700 hover:text-pink-600 transition-colors">
              Become a Host
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-pink-600 transition-colors">
              About
            </Link>
            
            {user ? (
              <Link 
                href="/settings" 
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Settings"
              >
                <Settings className="w-6 h-6 text-gray-700 hover:text-pink-600" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-pink-600 transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-3">
            {user ? (
              <Link href="/settings" className="p-2">
                <Settings className="w-6 h-6 text-gray-700" />
              </Link>
            ) : (
              <Link href="/login" className="text-pink-600 font-medium">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
