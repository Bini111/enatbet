/**
 * Currency Constants and Exchange Rates
 */

import type { Currency } from '../types/money';

/**
 * Currency symbols
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  ETB: 'Br',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/**
 * Currency decimal places
 */
export const CURRENCY_DECIMALS: Record<Currency, number> = {
  ETB: 2,
  USD: 2,
  EUR: 2,
  GBP: 2,
};

/**
 * Currency names
 */
export const CURRENCY_NAMES: Record<Currency, string> = {
  ETB: 'Ethiopian Birr',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
};

/**
 * Exchange rates (base: ETB)
 * NOTE: In production, these should be fetched from a live API
 * and updated regularly
 */
export const EXCHANGE_RATES: Record<Currency, Record<Currency, number>> = {
  ETB: {
    ETB: 1,
    USD: 0.018, // Example rate: 1 ETB ≈ 0.018 USD
    EUR: 0.017,
    GBP: 0.014,
  },
  USD: {
    ETB: 55.5, // Example rate: 1 USD ≈ 55.5 ETB
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
  },
  EUR: {
    ETB: 60.0,
    USD: 1.09,
    EUR: 1,
    GBP: 0.86,
  },
  GBP: {
    ETB: 70.0,
    USD: 1.27,
    EUR: 1.16,
    GBP: 1,
  },
};

/**
 * Supported currencies for the platform
 */
export const SUPPORTED_CURRENCIES: Currency[] = ['ETB', 'USD', 'EUR', 'GBP'];

/**
 * Default currency
 */
export const DEFAULT_CURRENCY: Currency = 'ETB';

/**
 * Service fee percentage (platform commission)
 */
export const SERVICE_FEE_PERCENTAGE = 10;

/**
 * Host payout percentage (after service fee)
 */
export const HOST_PAYOUT_PERCENTAGE = 90;

/**
 * VAT/Tax rate (percentage)
 */
export const DEFAULT_TAX_RATE = 15; // 15% VAT in Ethiopia

/**
 * Minimum payout amount
 */
export const MINIMUM_PAYOUT_AMOUNT: Record<Currency, number> = {
  ETB: 1000,
  USD: 20,
  EUR: 20,
  GBP: 20,
};

/**
 * Maximum transaction amount
 */
export const MAXIMUM_TRANSACTION_AMOUNT: Record<Currency, number> = {
  ETB: 1000000,
  USD: 20000,
  EUR: 20000,
  GBP: 20000,
};
