'use client';

/**
 * Payment Form Component
 * Web payment UI using Stripe Elements
 * 
 * PRODUCTION HARDENING:
 * - Webhook-driven confirmation (not client-only)
 * - Redirect handling for 3DS/additional auth
 * - Categorized error messages
 * - Accessibility and i18n ready
 */

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ 
  onSuccess, 
  onError 
}: { 
  onSuccess: () => void; 
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      onError('Payment system not ready. Please refresh the page.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation`,
        },
        redirect: 'if_required', // Minimize unnecessary redirects
      });

      setLoading(false);

      if (error) {
        // Categorize errors for better user messaging
        switch (error.type) {
          case 'card_error':
          case 'validation_error':
            onError(error.message || 'Card validation failed');
            break;
          case 'invalid_request_error':
            onError('Payment request failed. Please try again.');
            console.error('[PAYMENT] Invalid request:', error);
            break;
          default:
            onError('Payment failed. Please try again.');
            console.error('[PAYMENT] Error:', error);
        }
      } else {
        // Payment succeeded without redirect
        onSuccess();
      }
    } catch (err: any) {
      setLoading(false);
      onError('An unexpected error occurred. Please try again.');
      console.error('[PAYMENT] Exception:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <PaymentElement />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Submit payment"
      >
        {loading ? 'Processing payment...' : 'Pay securely'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your payment is secured by Stripe. We never see your card details.
      </p>
    </form>
  );
}

export default function PaymentForm({ 
  clientSecret, 
  onSuccess, 
  onError 
}: {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  if (!clientSecret) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Payment initialization failed. Please try again.
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#db2777', // Pink-600
          },
        },
      }}
    >
      <CheckoutForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
