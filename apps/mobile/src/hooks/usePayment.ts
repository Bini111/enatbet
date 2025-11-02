import { useState } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import { auth } from '@/lib/firebase';
import type { BookingRequest, PaymentResult } from '@enatbet/shared';

export function usePayment() {
  const { confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = async (booking: BookingRequest) => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/stripe/create-payment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Payment failed');
    }
    return res.json();
  };

  const processPayment = async (
    clientSecret: string,
    billingDetails: { email: string; name?: string; phone?: string }
  ): Promise<PaymentResult> => {
    setLoading(true);
    setError(null);
    try {
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: { billingDetails },
      });
      if (error) throw new Error(error.message);
      return { success: true, paymentIntentId: paymentIntent?.id };
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { createPaymentIntent, processPayment, loading, error };
}
