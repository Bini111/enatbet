import { Suspense } from 'react';
import PaymentForm from '@/components/PaymentForm';
import Link from 'next/link';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function validateBookingParams(params: any) {
  const { listingId, checkIn, checkOut } = params;
  
  if (!listingId || typeof listingId !== 'string') return false;
  if (!checkIn || typeof checkIn !== 'string') return false;
  if (!checkOut || typeof checkOut !== 'string') return false;
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) return false;
  if (checkOutDate <= checkInDate) return false;
  if (checkInDate <= new Date()) return false;
  
  return true;
}

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: {
    listingId?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    title?: string;
  };
}) {
  const isValid = validateBookingParams(searchParams);
  
  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Invalid booking details</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  const bookingDetails = {
    listingId: searchParams.listingId!,
    checkIn: searchParams.checkIn!,
    checkOut: searchParams.checkOut!,
    guests: searchParams.guests || '1',
    title: searchParams.title || '',
  };

  const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.enatbet.app'}/bookings`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <Link href={`/listings/${bookingDetails.listingId}`} className="text-sm text-gray-600 hover:underline">
            ← Back to listing
          </Link>
          <h1 className="text-2xl font-bold mt-2">Confirm and pay</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold mb-4">Your trip</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Dates</p>
                    <p className="text-sm text-gray-600">
                      {bookingDetails.checkIn} → {bookingDetails.checkOut}
                    </p>
                  </div>
                  <Link 
                    href={`/listings/${bookingDetails.listingId}`} 
                    className="text-sm underline"
                  >
                    Edit
                  </Link>
                </div>
                
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Guests</p>
                    <p className="text-sm text-gray-600">
                      {bookingDetails.guests} {bookingDetails.guests === '1' ? 'guest' : 'guests'}
                    </p>
                  </div>
                  <Link 
                    href={`/listings/${bookingDetails.listingId}`} 
                    className="text-sm underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold mb-4">Cancellation policy</h2>
              <p className="text-sm text-gray-600">
                Free cancellation for 48 hours. After that, cancel before check-in 
                and get a 50% refund, minus the service fee.
              </p>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold mb-6">Pay with</h2>
              
              <Suspense fallback={
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              }>
                <PaymentForm 
                  bookingDetails={bookingDetails}
                  returnUrl={returnUrl}
                />
              </Suspense>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 leading-relaxed">
                  By confirming, you agree to our Terms of Service, Privacy Policy, 
                  and that you're at least 18 years old. Your payment information is 
                  encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
