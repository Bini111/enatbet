'use client';

import Link from 'next/link';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Resources & Help</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about using Enatbet, whether you are a guest looking for a home or a host sharing your space.
          </p>
        </div>

        {/* For Guests */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-2" role="img" aria-label="Suitcase">🧳</span>
            For Guests
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-3">How to Book a Property</h3>
              <ol className="text-gray-600 space-y-2 list-decimal list-inside">
                <li>Browse properties in your destination city</li>
                <li>Check availability and read reviews</li>
                <li>Click "Book Now" and select your dates</li>
                <li>Complete payment securely through Stripe</li>
                <li>Receive confirmation and host contact details</li>
              </ol>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-3">Booking Tips</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Book early for popular dates and holidays</li>
                <li>• Read property descriptions carefully</li>
                <li>• Message hosts with questions before booking</li>
                <li>• Review the cancellation policy</li>
                <li>• Save properties you like to compare later</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-3">Payment & Security</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• All payments processed securely via Stripe</li>
                <li>• Never pay outside the platform</li>
                <li>• Funds held until 24 hours after check-in</li>
                <li>• Full refund for cancellations per policy</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-3">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                Having issues with a booking or need assistance? Our support team is here to help.
              </p>
              <Link href="/contact" className="text-pink-600 hover:underline font-medium">
                Contact Support →
              </Link>
            </div>
          </div>
        </div>

        {/* For Hosts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-2" role="img" aria-label="House">🏠</span>
            For Hosts
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-3">Getting Started as a Host</h3>
              <ol className="text-gray-600 space-y-2 list-decimal list-inside">
                <li>Submit your host application</li>
                <li>Get verified by our team</li>
                <li>Create your property listing</li>
                <li>Set your pricing and availability</li>
                <li>Start receiving bookings</li>
              </ol>
              <Link href="/become-a-host" className="inline-block mt-4 text-pink-600 hover:underline font-medium">
                Apply to Host →
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-3">Hosting Best Practices</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Take high-quality photos of your space</li>
                <li>• Write detailed, accurate descriptions</li>
                <li>• Respond to inquiries within 24 hours</li>
                <li>• Keep your calendar up to date</li>
                <li>• Provide clean linens and essentials</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-3">Payments & Payouts</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Payouts sent within 24 hours of check-in</li>
                <li>• Direct deposit to your bank account</li>
                <li>• Platform fee: 10% of booking total</li>
                <li>• View earnings in your dashboard</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-3">Host Protection</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• All guests are verified</li>
                <li>• Secure payment processing</li>
                <li>• 24/7 support for urgent issues</li>
                <li>• Clear cancellation policies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-2" role="img" aria-label="Question">❓</span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold mb-2">What makes Enatbet different from other rental platforms?</h3>
              <p className="text-gray-600">Enatbet is built specifically for the Ethiopian and Eritrean diaspora community. We focus on connecting community members worldwide, making it easier to find welcoming homes that understand your cultural needs.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold mb-2">Is Enatbet available in my country?</h3>
              <p className="text-gray-600">We are growing! Currently, we have hosts in major cities across North America, Europe, and Africa. Check our properties page to see available listings in your destination.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold mb-2">How do I cancel a booking?</h3>
              <p className="text-gray-600">You can cancel bookings from your dashboard. Refund amounts depend on the property cancellation policy and how far in advance you cancel. See our{' '}
                <Link href="/terms-of-service" className="text-pink-600 hover:underline">Terms of Service</Link> for details.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold mb-2">How do I report an issue with a property or host?</h3>
              <p className="text-gray-600">Please{' '}
                <Link href="/contact" className="text-pink-600 hover:underline">contact our support team</Link> immediately with details about your concern. We take all reports seriously and will investigate promptly.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-bold mb-4">Legal & Policies</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/terms-of-service" className="text-pink-600 hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="text-pink-600 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service#cancellation-policy" className="text-pink-600 hover:underline">
              Cancellation Policy
            </Link>
            <Link href="/terms-of-service#host-agreement" className="text-pink-600 hover:underline">
              Host Agreement
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
