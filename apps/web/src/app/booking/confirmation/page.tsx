'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const clientSecret = searchParams.get('payment_intent_client_secret');
    
    if (!clientSecret) {
      setStatus('error');
      setMessage('Invalid payment confirmation');
      return;
    }

    stripePromise.then(async (stripe) => {
      if (!stripe) {
        setStatus('error');
        setMessage('Failed to load payment system');
        return;
      }

      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
      
      switch (paymentIntent?.status) {
        case 'succeeded':
          setStatus('success');
          setMessage('Payment successful! Your booking is confirmed.');
          break;
        case 'processing':
          setStatus('loading');
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setStatus('error');
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setStatus('error');
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900">Processing...</h1>
            <p className="text-gray-600 mt-2">{message || 'Please wait while we confirm your payment.'}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Booking Confirmed!</h1>
            <p className="text-gray-600 mt-2">{message}</p>
            <a href="/bookings" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              View My Bookings
            </a>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Payment Failed</h1>
            <p className="text-gray-600 mt-2">{message}</p>
            <a href="/" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Return Home
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function BookingConfirmation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
