'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [tapCount, setTapCount] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleEasterEgg = () => {
    setTapCount(prev => {
      const newCount = prev + 1;
      
      // Clear existing timer
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
      
      // Set new timer - reset after 2 seconds
      tapTimerRef.current = setTimeout(() => {
        setTapCount(0);
      }, 2000);
      
      // 5 taps unlocks admin
      if (newCount >= 5) {
        setShowAdmin(true);
        sessionStorage.setItem('adminUnlocked', 'true');
        return 0;
      }
      
      return newCount;
    });
  };

  // Check sessionStorage on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const unlocked = sessionStorage.getItem('adminUnlocked');
      if (unlocked === 'true') {
        setShowAdmin(true);
      }
    }
  });

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🇪🇹</span>
              <span className="text-2xl">🏠</span>
              <span className="text-2xl">🇪🇷</span>
              <span className="text-xl font-bold">ENATBET</span>
            </div>
            <p className="text-gray-400">
              Connecting Ethiopian & Eritrean diaspora communities worldwide
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Get the App</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/download" className="hover:text-white">Download App</Link></li>
              <li><Link href="/share" className="hover:text-white">Share with Friends</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex justify-between items-center">
          <p className="text-gray-400">
            <span 
              onClick={handleEasterEgg} 
              className="cursor-default select-none"
            >
              ©
            </span>
            {' '}2025{' '}
            <span 
              onClick={handleEasterEgg} 
              className="cursor-default select-none"
            >
              Enatbet
            </span>
            . All rights reserved.
          </p>
          {showAdmin && (
            <Link 
              href="/admin" 
              className="text-gray-600 hover:text-pink-500 text-sm transition-colors"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
