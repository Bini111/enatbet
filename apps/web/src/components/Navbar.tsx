'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { Settings, User, LogIn, UserPlus, Home, HelpCircle, FileText, Shield, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            
            {/* Gear Menu - Always visible */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-6 h-6 text-gray-700 hover:text-pink-600" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  {user ? (
                    <>
                      {/* Logged in menu */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{user.displayName || 'User'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Link href="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                        <Settings className="w-5 h-5 text-gray-500" />
                        <span>Settings</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Not logged in menu */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900">Welcome</p>
                        <p className="text-sm text-gray-500">Sign in to access your account</p>
                      </div>
                      <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                        <LogIn className="w-5 h-5 text-gray-500" />
                        <span>Sign In</span>
                      </Link>
                      <Link href="/signup" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                        <UserPlus className="w-5 h-5 text-gray-500" />
                        <span>Sign Up</span>
                      </Link>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <Link href="/become-a-host" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                          <Home className="w-5 h-5 text-gray-500" />
                          <span>Become a Host</span>
                        </Link>
                        <Link href="/contact" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                          <HelpCircle className="w-5 h-5 text-gray-500" />
                          <span>Help</span>
                        </Link>
                        <Link href="/terms-of-service" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <span>Terms of Service</span>
                        </Link>
                        <Link href="/privacy-policy" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                          <Shield className="w-5 h-5 text-gray-500" />
                          <span>Privacy Policy</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
              <Settings className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          {user ? (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-medium">{user.displayName || 'User'}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <Link href="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-3">Settings</Link>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-3">Sign In</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="block px-4 py-3">Sign Up</Link>
              <Link href="/become-a-host" onClick={() => setMenuOpen(false)} className="block px-4 py-3">Become a Host</Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)} className="block px-4 py-3">Help</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
