import Link from 'next/link';

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">📱</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Get the Enatbet App</h1>
        <p className="text-gray-600 mb-8">
          Book homes on the go. Download our mobile app for the best experience.
        </p>

        <div className="space-y-4">
          
            href="https://apps.apple.com/app/enatbet"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-black text-white py-4 px-6 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <span className="text-2xl">🍎</span>
            <div className="text-left">
              <p className="text-xs">Download on the</p>
              <p className="text-lg font-semibold">App Store</p>
            </div>
          </a>

          
            href="https://play.google.com/store/apps/details?id=com.enatbet.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-black text-white py-4 px-6 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <span className="text-2xl">▶️</span>
            <div className="text-left">
              <p className="text-xs">Get it on</p>
              <p className="text-lg font-semibold">Google Play</p>
            </div>
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-4">Or continue on web</p>
          <Link href="/properties" className="text-pink-600 font-medium hover:text-pink-700">
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
