'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function BookingConfirmation() {
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

    const checkPaymentStatus = async () => {
      const stripe = await stripePromise;
      if (!stripe) {
        setStatus('error');
        setMessage('Payment system error');
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
          setMessage('Payment processing. Please wait...');
          break;
        case 'requires_payment_method':
          setStatus('error');
          setMessage('Payment failed. Please try another payment method.');
          break;
        default:
          setStatus('error');
          setMessage('Payment status unknown. Please contact support.');
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <a href="/bookings" className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700">
              View My Bookings
            </a>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <a href="/" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
              Return Home
            </a>
          </>
        )}
      </div>
    </div>
  );
}
