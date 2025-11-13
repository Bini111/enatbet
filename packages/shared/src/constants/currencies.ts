/**
 * Currency definitions for EnatBet
 * Production-ready with proper Stripe charge currency handling
 * 
 * IMPORTANT: This file contains pure constants for UI/formatting only.
 * Business logic (fees, taxes, minimums validation) must be server-side.
 */

// Currency definitions (UI and formatting)
export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$',  name: 'US Dollar',        decimals: 2 },
  EUR: { code: 'EUR', symbol: '€',  name: 'Euro',             decimals: 2 },
  GBP: { code: 'GBP', symbol: '£',  name: 'British Pound',    decimals: 2 },
  ETB: { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr',   decimals: 2 }, // UI only - verify Stripe support
} as const;

export type Currency = keyof typeof CURRENCIES;

export const DEFAULT_CURRENCY: Currency = 'USD';

/**
 * Type guard for Currency
 */
export const isCurrency = (v: string): v is Currency =>
  Object.prototype.hasOwnProperty.call(CURRENCIES, v);

/**
 * Get currency information
 */
export const getCurrencyInfo = (currency: Currency) => {
  return CURRENCIES[currency];
};

/**
 * Convert major units to minor units
 * Handles currencies with different decimal places
 * Example: 10.50 USD -> 1050 cents
 */
export const toMinorUnits = (amountMajor: number, currency: Currency): number => {
  const { decimals } = CURRENCIES[currency];
  return Math.round(amountMajor * 10 ** decimals);
};

/**
 * Convert minor units to major units
 * Example: 1050 cents -> 10.50 USD
 */
export const fromMinorUnits = (amountMinor: number, currency: Currency): number => {
  const { decimals } = CURRENCIES[currency];
  return amountMinor / 10 ** decimals;
};

/**
 * Stripe minimum charge amounts by charge (presentment) currency in minor units
 * 
 * CRITICAL: Stripe enforces minimums on BOTH:
 * 1. The charge currency (presentment)
 * 2. The settlement currency after conversion
 * 
 * Both conditions must be satisfied. Use server-side validator for production.
 * 
 * References:
 * - Create Charge: https://docs.stripe.com/api/charges/create (minimum $0.50 or equivalent)
 * - Create PaymentIntent: https://docs.stripe.com/api/payment_intents/create (same minimum)
 * - Currency details: https://docs.stripe.com/currencies (settlement conversion rules)
 */
export const STRIPE_MIN_CHARGE_MINOR_UNITS = {
  USD: 50,  // $0.50
  EUR: 50,  // €0.50
  GBP: 30,  // £0.30
} as const;

// Type-safe currency keys for Stripe minimums
export type StripeMinCurrency = keyof typeof STRIPE_MIN_CHARGE_MINOR_UNITS;

/**
 * Simple charge currency minimum check
 * WARNING: This only checks the charge currency minimum.
 * Production code must also validate settlement currency minimum after conversion.
 * Use meetsStripeMinimumConservative (server-side) for full validation.
 */
export const meetsStripeMinimum = (
  amountMinor: number,
  chargeCurrency: StripeMinCurrency
): boolean => {
  return amountMinor >= STRIPE_MIN_CHARGE_MINOR_UNITS[chargeCurrency];
};

/**
 * Get Stripe minimum for a currency in major units
 */
export const getStripeMinimumMajor = (chargeCurrency: StripeMinCurrency): number => {
  const minorAmount = STRIPE_MIN_CHARGE_MINOR_UNITS[chargeCurrency];
  // Safe to cast since we know these currencies have 2 decimals
  return fromMinorUnits(minorAmount, chargeCurrency as Currency);
};

/**
 * Zero-decimal currencies list
 * These currencies have no minor units (e.g., 1000 JPY = ¥1000, not ¥10.00)
 * Reference: https://docs.stripe.com/currencies#zero-decimal
 */
export const ZERO_DECIMAL_CURRENCIES: ReadonlySet<string> = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW',
  'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF',
  'XOF', 'XPF',
]);

/**
 * Check if a currency is zero-decimal
 */
export const isZeroDecimal = (currency: string): boolean => {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase());
};

/**
 * Configuration keys for server-side business logic
 * Values must be loaded from environment/database at runtime
 */
export const CONFIG_KEYS = {
  PLATFORM_FEE_PERCENTAGE: 'PLATFORM_FEE_PERCENTAGE',
  TAX_RATE: 'TAX_RATE',
  MIN_BOOKING_AMOUNT_MAJOR: 'MIN_BOOKING_AMOUNT_MAJOR',
} as const;
