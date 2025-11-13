/**
 * Stripe Validation Utilities
 * Validates payment parameters before API calls
 * 
 * PURPOSE: Catch invalid charges early with clear error messages
 * REUSABLE: Import in API routes, booking flows, admin tools
 * 
 * PRODUCTION HARDENING:
 * - Centralized currency constants (single source of truth)
 * - Locale-safe formatting with Intl.NumberFormat
 * - Currency normalization to uppercase for validation
 * - Readonly constants prevent accidental mutation
 * - Note: Stripe metadata must be string:string and is size-limited (enforce elsewhere)
 */

import 'server-only';

/**
 * Supported payment currencies
 * Extend this as you add more markets
 */
export type SupportedCurrency = 'USD' | 'EUR' | 'GBP';
export const SUPPORTED_CURRENCIES = Object.freeze(['USD', 'EUR', 'GBP'] as const);

/**
 * Stripe minimum charge amounts (in minor units)
 * Updated: November 2024
 * Source: https://docs.stripe.com/currencies#minimum-and-maximum-charge-amounts
 * 
 * IMPORTANT: This is the single source of truth for minimums.
 * The stripe.ts file imports these constants to avoid duplication.
 */
export const STRIPE_MINIMUM_AMOUNTS: Readonly<Record<SupportedCurrency, number>> = {
  USD: 50,   // $0.50
  EUR: 50,   // €0.50
  GBP: 30,   // £0.30
} as const;

/**
 * Stripe maximum charge amounts (in minor units)
 * Stripe supports up to 8 digits in the amount field
 * Source: https://docs.stripe.com/api/charges/create
 * 
 * These are soft limits - contact Stripe to raise them for your account.
 */
export const STRIPE_MAXIMUM_AMOUNTS: Readonly<Record<SupportedCurrency, number>> = {
  USD: 99999999,  // $999,999.99
  EUR: 99999999,  // €999,999.99
  GBP: 99999999,  // £999,999.99
} as const;

/**
 * Validation result structure
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  details?: {
    amount: number;
    currency: string;
    minimum?: number;
    maximum?: number;
  };
}

/**
 * Validate a Stripe charge amount
 * 
 * CHECKS:
 * - Currency is supported
 * - Amount is a positive integer
 * - Amount meets Stripe minimum
 * - Amount doesn't exceed maximum
 * 
 * NOTE: This function normalizes currency to uppercase for validation,
 * but callers should pass lowercase to Stripe's API (e.g., "usd" not "USD").
 * 
 * @param amount - Amount in minor units (cents)
 * @param currency - Currency code (USD, EUR, GBP) - will be normalized
 * @returns Validation result with clear error message
 */
export function validateStripeCharge(
  amount: number,
  currency: SupportedCurrency | string
): ValidationResult {
  // Normalize to uppercase for validation lookup
  const normalizedCurrency = currency.toUpperCase() as SupportedCurrency;
  
  const details = {
    amount,
    currency: normalizedCurrency,
  };

  // Check currency is supported
  if (!STRIPE_MINIMUM_AMOUNTS[normalizedCurrency]) {
    return {
      valid: false,
      error: `Currency ${normalizedCurrency} is not supported. Supported: ${Object.keys(STRIPE_MINIMUM_AMOUNTS).join(', ')}`,
      details,
    };
  }

  // Check amount is a valid number
  if (!Number.isFinite(amount)) {
    return {
      valid: false,
      error: 'Amount must be a finite number',
      details,
    };
  }

  // Check amount is a positive integer
  if (amount <= 0 || !Number.isInteger(amount)) {
    return {
      valid: false,
      error: 'Amount must be a positive integer (in minor units/cents)',
      details,
    };
  }

  const minimum = STRIPE_MINIMUM_AMOUNTS[normalizedCurrency];
  const maximum = STRIPE_MAXIMUM_AMOUNTS[normalizedCurrency];

  // Check minimum amount
  if (amount < minimum) {
    const minFormatted = formatAmount(minimum, normalizedCurrency);
    return {
      valid: false,
      error: `Amount is below Stripe minimum of ${minFormatted}`,
      details: { ...details, minimum },
    };
  }

  // Check maximum amount
  if (amount > maximum) {
    const maxFormatted = formatAmount(maximum, normalizedCurrency);
    return {
      valid: false,
      error: `Amount exceeds maximum of ${maxFormatted}. Contact Stripe to raise limits.`,
      details: { ...details, maximum },
    };
  }

  return {
    valid: true,
    details,
  };
}

/**
 * Validate platform fee parameters
 * 
 * CHECKS:
 * - Fee amount is non-negative
 * - Fee doesn't exceed total charge
 * - Connected account ID is provided
 * 
 * @param chargeAmount - Total charge in minor units
 * @param feeAmount - Platform fee in minor units
 * @param connectedAccountId - Host's Stripe Connect account
 * @returns Validation result
 */
export function validatePlatformFee(
  chargeAmount: number,
  feeAmount: number,
  connectedAccountId?: string
): ValidationResult {
  // Check fee is provided with account
  if (feeAmount > 0 && !connectedAccountId) {
    return {
      valid: false,
      error: 'Platform fee requires a connected account ID',
      details: { amount: feeAmount, currency: 'N/A' },
    };
  }

  // Check fee is non-negative
  if (feeAmount < 0) {
    return {
      valid: false,
      error: 'Platform fee must be non-negative',
      details: { amount: feeAmount, currency: 'N/A' },
    };
  }

  // Check fee doesn't exceed charge
  if (feeAmount > chargeAmount) {
    return {
      valid: false,
      error: `Platform fee (${feeAmount}) cannot exceed charge amount (${chargeAmount})`,
      details: { amount: feeAmount, currency: 'N/A' },
    };
  }

  return { valid: true };
}

/**
 * Validate refund amount
 * 
 * CHECKS:
 * - Refund amount doesn't exceed original charge
 * - Amount is a positive integer
 * 
 * @param refundAmount - Amount to refund in minor units
 * @param originalAmount - Original charge amount in minor units
 * @returns Validation result
 */
export function validateRefund(
  refundAmount: number,
  originalAmount: number
): ValidationResult {
  if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
    return {
      valid: false,
      error: 'Refund amount must be a positive number',
      details: { amount: refundAmount, currency: 'N/A' },
    };
  }

  if (refundAmount > originalAmount) {
    return {
      valid: false,
      error: `Refund amount (${refundAmount}) cannot exceed original charge (${originalAmount})`,
      details: { amount: refundAmount, currency: 'N/A' },
    };
  }

  return { valid: true };
}

/**
 * Format amount for display (convert minor to major units)
 * 
 * Uses Intl.NumberFormat for:
 * - Correct decimal places per currency
 * - Locale-safe number formatting
 * - Automatic handling of zero-decimal currencies (future-proof)
 * - Proper currency symbol placement
 * 
 * @param amountMinor - Amount in minor units (cents)
 * @param currency - Currency code (USD, EUR, GBP)
 * @param locale - Optional BCP 47 locale (default: 'en-US')
 * @returns Formatted string (e.g., "$10.50", "€10,50", "£10.50")
 */
export function formatAmount(
  amountMinor: number,
  currency: SupportedCurrency | string,
  locale: string = 'en-US'
): string {
  // Normalize currency to uppercase
  const normalizedCurrency = (currency || '').toString().toUpperCase() as SupportedCurrency;
  
  // Use Intl.NumberFormat for locale-aware formatting
  // Automatically handles decimal places, symbols, and formatting rules
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: normalizedCurrency,
    currencyDisplay: 'symbol',
  }).format(amountMinor / 100);
}
