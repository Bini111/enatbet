/**
 * Money utilities - production-ready with integer minor-unit math
 * All calculations performed in minor units to avoid float precision issues
 * Configuration (fees, taxes) must be passed as parameters
 */

import type { Currency } from '../constants/currencies';
import type { Money, PriceBreakdown } from '../types/money';
import {
  toMinorUnits,
  fromMinorUnits,
  meetsStripeMinimum,
  STRIPE_MIN_CHARGE_MINOR_UNITS,
  StripeMinCurrency
} from '../constants/currencies';

// Integer arithmetic helpers (minor units only)
const addMinor = (a: number, b: number): number => a + b;
const subMinor = (a: number, b: number): number => a - b;
const mulPercentMinor = (baseMinor: number, rate: number): number => 
  Math.round(baseMinor * rate); // Round to nearest minor unit

export const createMoney = (amount: number, currency: Currency = 'USD'): Money => ({
  amount,
  currency
});

/**
 * Add two Money values (integer math in minor units)
 */
export const addMoney = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency) {
    throw new Error('Cannot add money with different currencies');
  }
  const aMinor = toMinorUnits(a.amount, a.currency);
  const bMinor = toMinorUnits(b.amount, b.currency);
  const resultMinor = addMinor(aMinor, bMinor);
  
  return {
    amount: fromMinorUnits(resultMinor, a.currency),
    currency: a.currency
  };
};

/**
 * Subtract two Money values (integer math in minor units)
 */
export const subtractMoney = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency) {
    throw new Error('Cannot subtract money with different currencies');
  }
  const aMinor = toMinorUnits(a.amount, a.currency);
  const bMinor = toMinorUnits(b.amount, b.currency);
  const resultMinor = subMinor(aMinor, bMinor);
  
  return {
    amount: fromMinorUnits(resultMinor, a.currency),
    currency: a.currency
  };
};

/**
 * Multiply Money by a scalar (integer math with rounding)
 */
export const multiplyMoney = (money: Money, multiplier: number): Money => {
  const minor = toMinorUnits(money.amount, money.currency);
  const resultMinor = Math.round(minor * multiplier);
  
  return {
    amount: fromMinorUnits(resultMinor, money.currency),
    currency: money.currency
  };
};

/**
 * Calculate service fee with proper rounding
 * @param base - Base amount
 * @param feeRate - Fee percentage as decimal (e.g., 0.15 for 15%)
 */
export const calculateServiceFee = (base: Money, feeRate: number): Money => {
  const baseMinor = toMinorUnits(base.amount, base.currency);
  const feeMinor = mulPercentMinor(baseMinor, feeRate);
  
  return {
    amount: fromMinorUnits(feeMinor, base.currency),
    currency: base.currency
  };
};

/**
 * Calculate tax with proper rounding
 * @param amount - Amount to calculate tax on
 * @param taxRate - Tax percentage as decimal (e.g., 0.10 for 10%)
 */
export const calculateTax = (amount: Money, taxRate: number): Money => {
  const amountMinor = toMinorUnits(amount.amount, amount.currency);
  const taxMinor = mulPercentMinor(amountMinor, taxRate);
  
  return {
    amount: fromMinorUnits(taxMinor, amount.currency),
    currency: amount.currency
  };
};

/**
 * Calculate complete price breakdown using integer math
 * All intermediate calculations in minor units for precision
 * 
 * @param pricePerNight - Nightly rate
 * @param nights - Number of nights
 * @param platformFeeRate - Platform fee as decimal (e.g., 0.15)
 * @param taxRate - Tax rate as decimal (e.g., 0.10)
 * @param cleaningFee - Optional cleaning fee
 */
export const calculatePriceBreakdown = (
  pricePerNight: Money,
  nights: number,
  platformFeeRate: number,
  taxRate: number,
  cleaningFee?: Money
): PriceBreakdown => {
  const currency = pricePerNight.currency;
  
  // All calculations in minor units (integers)
  const baseMinor = toMinorUnits(pricePerNight.amount, currency) * nights;
  const cleaningMinor = cleaningFee ? toMinorUnits(cleaningFee.amount, currency) : 0;
  const subtotalMinor = addMinor(baseMinor, cleaningMinor);
  const serviceMinor = mulPercentMinor(subtotalMinor, platformFeeRate);
  const taxableMinor = addMinor(subtotalMinor, serviceMinor);
  const taxMinor = mulPercentMinor(taxableMinor, taxRate);
  const totalMinor = addMinor(taxableMinor, taxMinor);

  return {
    basePrice: {
      amount: fromMinorUnits(baseMinor, currency),
      currency
    },
    cleaningFee,
    serviceFee: {
      amount: fromMinorUnits(serviceMinor, currency),
      currency
    },
    tax: {
      amount: fromMinorUnits(taxMinor, currency),
      currency
    },
    total: {
      amount: fromMinorUnits(totalMinor, currency),
      currency
    }
  };
};

/**
 * Calculate host payout after platform fee
 */
export const calculateHostPayout = (total: Money, platformFeeRate: number): Money => {
  const fee = calculateServiceFee(total, platformFeeRate);
  return subtractMoney(total, fee);
};

/**
 * Convert Money to Stripe amount (minor units)
 * Example: { amount: 10.50, currency: 'USD' } -> 1050
 */
export const convertToStripeAmount = (money: Money): number => {
  return toMinorUnits(money.amount, money.currency);
};

/**
 * Convert Stripe amount (minor units) to Money
 * Example: 1050, 'USD' -> { amount: 10.50, currency: 'USD' }
 */
export const convertFromStripeAmount = (amount: number, currency: Currency): Money => {
  return {
    amount: fromMinorUnits(amount, currency),
    currency
  };
};

/**
 * Validate that a Money amount meets Stripe minimums
 * Uses canonical minimum table - no hardcoded fallbacks
 * Server-side only - do not import in client code
 */
export const validateStripeAmount = (
  money: Money
): { valid: boolean; minAmount?: Money; error?: string } => {
  // Check if currency is supported for Stripe charges
  if (!(money.currency in STRIPE_MIN_CHARGE_MINOR_UNITS)) {
    return {
      valid: false,
      error: `Unsupported charge currency: ${money.currency}. Only USD, EUR, GBP are supported.`
    };
  }
  
  const chargeCurrency = money.currency as StripeMinCurrency;
  const amountMinor = convertToStripeAmount(money);
  const isValid = meetsStripeMinimum(amountMinor, chargeCurrency);
  
  if (isValid) {
    return { valid: true };
  }
  
  // Use canonical minimum from table
  const minMinor = STRIPE_MIN_CHARGE_MINOR_UNITS[chargeCurrency];
  const minMoney: Money = {
    amount: fromMinorUnits(minMinor, chargeCurrency),
    currency: chargeCurrency
  };
  
  return {
    valid: false,
    minAmount: minMoney,
    error: `Amount must be at least ${minMoney.amount} ${chargeCurrency}`
  };
};
