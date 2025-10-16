// src/services/payment.service.ts
import { featureFlags } from '../utils/featureFlags';
import { Payment, PaymentStatus } from '../types/domain';

/**
 * Payment Gateway Interface
 * Abstracts payment processing to support multiple providers
 */
export interface PaymentGateway {
  createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<string>;
  presentPaymentSheet(clientSecret: string): Promise<PaymentResult>;
  confirmPayment(paymentIntentId: string, amount: number, currency: string): Promise<Payment>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

/**
 * Mock Payment Gateway for Expo Go Preview
 */
class MockPaymentGateway implements PaymentGateway {
  async createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<string> {
    console.log('[Mock Payment] Creating payment intent:', { amount, currency, metadata });
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async presentPaymentSheet(clientSecret: string): Promise<PaymentResult> {
    console.log('[Mock Payment] Presenting payment sheet for:', clientSecret);
    
    // Simulate user interaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Deterministic success for testing (90% success rate)
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        paymentId: clientSecret.replace('pi_mock_', 'ch_mock_'),
      };
    } else {
      return {
        success: false,
        error: 'Payment declined - insufficient funds (mock)',
      };
    }
  }

  async confirmPayment(paymentIntentId: string, amount: number, currency: string): Promise<Payment> {
    console.log('[Mock Payment] Confirming payment:', paymentIntentId, { amount, currency });
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return {
      id: `pay_${Date.now()}`,
      bookingId: 'booking_mock',
      userId: 'user_mock',
      amount, // Now using the provided amount
      currency,
      status: PaymentStatus.SUCCEEDED,
      paymentMethod: 'mock_card',
      transactionId: paymentIntentId,
      receiptUrl: 'https://example.com/receipt/mock',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

/**
 * Real Stripe Payment Gateway (for native builds)
 * Note: Requires @stripe/stripe-react-native and EAS dev client
 */
class StripePaymentGateway implements PaymentGateway {
  async createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<string> {
    // TODO: Call your backend to create a Stripe PaymentIntent
    // const response = await fetch('YOUR_BACKEND_URL/create-payment-intent', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount, currency, metadata }),
    // });
    // const { clientSecret } = await response.json();
    // return clientSecret;
    
    throw new Error('Real Stripe integration requires backend implementation');
  }

  async presentPaymentSheet(clientSecret: string): Promise<PaymentResult> {
    // Only import when needed (native build)
    // const { presentPaymentSheet } = await import('@stripe/stripe-react-native');
    // const { error } = await presentPaymentSheet({ clientSecret });
    // if (error) {
    //   return { success: false, error: error.message };
    // }
    // return { success: true, paymentId: 'stripe_payment_id' };
    
    throw new Error('Real Stripe integration requires @stripe/stripe-react-native');
  }

  async confirmPayment(paymentIntentId: string, amount: number, currency: string): Promise<Payment> {
    // TODO: Call backend to confirm and retrieve payment details
    throw new Error('Real Stripe integration requires backend implementation');
  }
}

/**
 * Payment Service - Factory pattern
 */
class PaymentService {
  private gateway: PaymentGateway;

  constructor() {
    // Use mock gateway for Expo Go, real Stripe for native builds
    this.gateway = featureFlags.useRealPayments
      ? new StripePaymentGateway()
      : new MockPaymentGateway();
  }

  async processPayment(
    bookingId: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<PaymentResult> {
    try {
      // Step 1: Create payment intent
      const clientSecret = await this.gateway.createPaymentIntent(amount, currency, {
        bookingId,
      });

      // Step 2: Present payment sheet to user
      const result = await this.gateway.presentPaymentSheet(clientSecret);

      return result;
    } catch (error: any) {
      console.error('[Payment Service] Error:', error);
      return {
        success: false,
        error: error.message || 'Payment failed',
      };
    }
  }

  async confirmPayment(paymentIntentId: string, amount: number, currency: string = 'USD'): Promise<Payment> {
    return this.gateway.confirmPayment(paymentIntentId, amount, currency);
  }

  isUsingMockPayments(): boolean {
    return !featureFlags.useRealPayments;
  }
}

export const paymentService = new PaymentService();