'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { formatCurrency, calculateNights, formatDateRange } from '@enatebet/shared';
import type { Listing } from '@enatebet/shared';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm({ listing, checkIn, checkOut, adults, children }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Create booking first
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: 'current-user-id', // Should come from auth
          bookingData: {
            listingId: listing.id,
            checkIn,
            checkOut,
            guests: { adults, children, infants: 0, pets: 0 },
            basePrice: listing.pricing.basePrice,
            cleaningFee: listing.pricing.cleaningFee,
          },
        }),
      });

      const bookingData = await bookingResponse.json();

      if (!bookingData.success) {
        throw new Error(bookingData.error);
      }

      // Create payment intent
      const paymentResponse = await fetch('/api/stripe/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: bookingData.data.pricing.total,
          bookingId: bookingData.data.id,
        }),
      });

      const paymentData = await paymentResponse.json();

      // Confirm payment
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation/${bookingData.data.id}`,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-4 rounded-lg font-semibold text-lg ${
          !stripe || processing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-pink-600 text-white hover:bg-pink-700'
        }`}
      >
        {processing ? 'Processing...' : 'Confirm and Pay'}
      </button>
    </form>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string>('');

  const listingId = searchParams.get('listingId');
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const adults = parseInt(searchParams.get('adults') || '1');
  const children = parseInt(searchParams.get('children') || '0');

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return;

      try {
        const response = await fetch(`/api/listings/${listingId}`);
        const data = await response.json();

        if (data.success) {
          setListing(data.data);
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  if (loading || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const nights = calculateNights(new Date(checkIn), new Date(checkOut));
  const subtotal = nights * listing.pricing.basePrice;
  const cleaningFee = listing.pricing.cleaningFee;
  const serviceFee = Math.round(subtotal * 0.15);
  const total = subtotal + cleaningFee + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Complete your booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Booking Summary */}
          <div className="bg-white rounded-lg p-6 shadow h-fit">
            <h2 className="text-xl font-bold mb-4">Booking Summary</h2>

            <div className="flex gap-4 pb-4 border-b">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-semibold">{listing.title}</h3>
                <p className="text-sm text-gray-600">{listing.location.city}</p>
              </div>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <p className="text-sm text-gray-600">Dates</p>
                <p className="font-medium">
                  {formatDateRange(new Date(checkIn), new Date(checkOut))}
                </p>
                <p className="text-sm text-gray-500">{nights} nights</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Guests</p>
                <p className="font-medium">
                  {adults} {adults === 1 ? 'adult' : 'adults'}
                  {children > 0 && `, ${children} ${children === 1 ? 'child' : 'children'}`}
                </p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {formatCurrency(listing.pricing.basePrice, listing.pricing.currency)} x {nights} nights
                </span>
                <span>{formatCurrency(subtotal, listing.pricing.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cleaning fee</span>
                <span>{formatCurrency(cleaningFee, listing.pricing.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service fee</span>
                <span>{formatCurrency(serviceFee, listing.pricing.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(total, listing.pricing.currency)}</span>
              </div>
            </div>
          </div>

          {/* Right: Payment Form */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold mb-4">Payment Details</h2>

            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  listing={listing}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  adults={adults}
                  children={children}
                />
              </Elements>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Initializing payment...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
