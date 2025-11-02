import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4 gap-4">
            <span className="text-6xl">🇪🇹</span>
            <h1 className="text-6xl font-bold">ENATBET</h1>
            <span className="text-6xl">🇪🇷</span>
          </div>
          <p className="text-3xl font-semibold mb-3 italic">
            "Book a home, not just a room"
          </p>
          <p className="text-xl mb-8 opacity-90">
            Connecting Ethiopian & Eritrean diaspora communities worldwide
          </p>
          <Link 
            href="/properties"
            className="inline-block bg-white text-pink-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
          >
            Start Exploring
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Enatbet?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">🏡</div>
            <h3 className="text-xl font-semibold mb-3">Community Homes</h3>
            <p className="text-gray-600">Stay with Ethiopian & Eritrean families worldwide</p>
          </div>
          
          <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">☕</div>
            <h3 className="text-xl font-semibold mb-3">Cultural Experience</h3>
            <p className="text-gray-600">Enjoy coffee ceremonies and traditional hospitality</p>
          </div>
          
          <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-3">Trusted Network</h3>
            <p className="text-gray-600">Book with confidence within our community</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-50 via-yellow-50 to-red-50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Home Away From Home?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands in our global Ethiopian & Eritrean community
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/properties"
              className="inline-block bg-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Find a Home
            </Link>
            <Link 
              href="/signup"
              className="inline-block bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              List Your Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
