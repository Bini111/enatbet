import 'server-only';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const API_VERSION = '2023-10-16' as Stripe.StripeConfig['apiVersion'];

// Lazy initialization - don't throw at build time
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: API_VERSION,
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = { get instance() { return getStripe(); } };

export async function createCustomer(email: string, name?: string) {
  const s = getStripe();
  const existing = await s.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) return existing.data[0];
  return s.customers.create({ email, name, metadata: { source: 'enatbet' } });
}

export async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  customerId: string;
  connectedAccountId?: string;
  applicationFeeAmount?: number;
  metadata?: Record<string, string>;
  idempotencyKey?: string;
}) {
  const s = getStripe();
  const {
    amount,
    currency,
    customerId,
    connectedAccountId,
    applicationFeeAmount,
    metadata,
    idempotencyKey,
  } = params;

  const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
    amount,
    currency,
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    metadata,
  };

  if (connectedAccountId && applicationFeeAmount) {
    paymentIntentParams.application_fee_amount = applicationFeeAmount;
    paymentIntentParams.transfer_data = { destination: connectedAccountId };
  }

  return s.paymentIntents.create(
    paymentIntentParams,
    idempotencyKey ? { idempotencyKey } : undefined
  );
}

export async function createEphemeralKey(customerId: string, apiVersion: string) {
  const s = getStripe();
  return s.ephemeralKeys.create(
    { customer: customerId },
    { apiVersion }
  );
}

export async function refundPayment(paymentIntentId: string, amount?: number) {
  const s = getStripe();
  return s.refunds.create({
    payment_intent: paymentIntentId,
    amount,
  });
}
