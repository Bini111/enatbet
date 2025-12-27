'use client';

import Link from 'next/link';

export default function Footer() {
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
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Hosting</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/become-a-host" className="hover:text-white">Become a Host</Link></li>
              <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <p className="text-gray-400 text-center">© 2025 Enatbet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
