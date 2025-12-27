'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { Settings, User, Calendar, Home, CreditCard, HelpCircle, FileText, LogOut, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, signOutUser } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    // Clear admin cookie on logout
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    await signOutUser();
    window.location.href = '/';
  };

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
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.displayName || 'User'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>

                    {/* Account Section */}
                    <div className="py-2">
                      <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase">Account</p>
                      <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    </div>

                    {/* Trips Section */}
                    <div className="py-2 border-t border-gray-100">
                      <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase">Trips</p>
                      <Link href="/bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <Calendar className="w-4 h-4" />
                        My Bookings
                      </Link>
                    </div>

                    {/* Hosting Section */}
                    <div className="py-2 border-t border-gray-100">
                      <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase">Hosting</p>
                      <Link href="/become-a-host" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <Home className="w-4 h-4" />
                        Become a Host
                      </Link>
                    </div>

                    {/* Support Section */}
                    <div className="py-2 border-t border-gray-100">
                      <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase">Support</p>
                      <Link href="/contact" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <HelpCircle className="w-4 h-4" />
                        Help & Contact
                      </Link>
                    </div>

                    {/* Legal Section */}
                    <div className="py-2 border-t border-gray-100">
                      <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase">Legal</p>
                      <Link href="/terms-of-service" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <FileText className="w-4 h-4" />
                        Terms of Service
                      </Link>
                      <Link href="/privacy-policy" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <FileText className="w-4 h-4" />
                        Privacy Policy
                      </Link>
                    </div>

                    {/* Admin Section - Only for admins */}
                    {isAdmin && (
                      <div className="py-2 border-t border-gray-100">
                        <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase">Admin</p>
                        <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-pink-600 hover:bg-pink-50">
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      </div>
                    )}

                    {/* Logout */}
                    <div className="py-2 border-t border-gray-100">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

          {/* Mobile menu */}
          <div className="md:hidden flex items-center gap-3">
            {user ? (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-700 p-2"
              >
                <Settings className="w-5 h-5" />
              </button>
            ) : (
              <Link href="/login" className="text-pink-600 font-medium">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {user && menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700">Profile</Link>
          <Link href="/bookings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700">My Bookings</Link>
          <Link href="/become-a-host" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700">Become a Host</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700">Help</Link>
          {isAdmin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-pink-600">Admin Panel</Link>
          )}
          <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-red-600">Sign Out</button>
        </div>
      )}
    </nav>
  );
}
