import 'server-only';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const API_VERSION = (process.env.STRIPE_API_VERSION || '2025-10-29.clover') as Stripe.StripeConfig['apiVersion'];

if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: API_VERSION,
  typescript: true,
});

export async function createCustomer(email: string, name?: string) {
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) return existing.data[0];
  return stripe.customers.create({ email, name, metadata: { source: 'enatbet' } });
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
  const {
    amount,
    currency,
    customerId,
    connectedAccountId,
    applicationFeeAmount,
    metadata,
    idempotencyKey,
  } = params;

  const intentParams: Stripe.PaymentIntentCreateParams = {
    amount,
    currency: currency.toLowerCase(),
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    metadata,
  };

  if (connectedAccountId && applicationFeeAmount != null) {
    intentParams.application_fee_amount = applicationFeeAmount;
    intentParams.transfer_data = { destination: connectedAccountId };
  }

  const options: Stripe.RequestOptions = {};
  if (idempotencyKey) options.idempotencyKey = idempotencyKey;

  return stripe.paymentIntents.create(intentParams, options);
}

export async function createEphemeralKey(customerId: string, apiVersion: string) {
  return stripe.ephemeralKeys.create({ customer: customerId }, { apiVersion });
}

export { API_VERSION };
