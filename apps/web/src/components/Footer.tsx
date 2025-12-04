import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">🇪🇹🏠🇪🇷</span>
              <span className="text-xl font-bold">ENATBET</span>
            </div>
            <p className="text-gray-400 text-sm">
              Connecting Ethiopian & Eritrean diaspora communities worldwide
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/about" className="hover:text-pink-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-pink-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="font-semibold mb-4">Hosting</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/become-a-host" className="hover:text-pink-400 transition-colors">
                  Become a Host
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-pink-400 transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/terms-of-service" className="hover:text-pink-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-pink-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Enatbet. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
