/**
 * Money and Currency Utilities
 */

import type { Money, Currency, CurrencyFormatOptions } from '../types/money';
import { CURRENCY_SYMBOLS, CURRENCY_DECIMALS, EXCHANGE_RATES } from '../constants/currencies';

/**
 * Format money amount with currency symbol
 */
export function formatMoney(money: Money, options: CurrencyFormatOptions = {}): string {
  const {
    locale = 'en-US',
    showSymbol = true,
    showCode = false,
    decimals = CURRENCY_DECIMALS[money.currency] || 2,
  } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: money.currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const formatted = formatter.format(money.amount);

  if (showCode && !showSymbol) {
    return `${formatted} ${money.currency}`;
  }

  return formatted;
}

/**
 * Create a Money object
 */
export function createMoney(amount: number, currency: Currency): Money {
  return {
    amount: roundToDecimal(amount, CURRENCY_DECIMALS[currency] || 2),
    currency,
  };
}

/**
 * Add two money amounts (must be same currency)
 */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add different currencies: ${a.currency} and ${b.currency}`);
  }
  return createMoney(a.amount + b.amount, a.currency);
}

/**
 * Subtract money amounts (must be same currency)
 */
export function subtractMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot subtract different currencies: ${a.currency} and ${b.currency}`);
  }
  return createMoney(a.amount - b.amount, a.currency);
}

/**
 * Multiply money by a factor
 */
export function multiplyMoney(money: Money, factor: number): Money {
  return createMoney(money.amount * factor, money.currency);
}

/**
 * Calculate percentage of money amount
 */
export function percentageOfMoney(money: Money, percentage: number): Money {
  return createMoney((money.amount * percentage) / 100, money.currency);
}

/**
 * Convert money from one currency to another
 */
export function convertMoney(money: Money, toCurrency: Currency): Money {
  if (money.currency === toCurrency) {
    return money;
  }

  const rate = EXCHANGE_RATES[money.currency]?.[toCurrency];
  if (!rate) {
    throw new Error(`No exchange rate found for ${money.currency} to ${toCurrency}`);
  }

  return createMoney(money.amount * rate, toCurrency);
}

/**
 * Compare two money amounts
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareMoney(a: Money, b: Money): number {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot compare different currencies: ${a.currency} and ${b.currency}`);
  }

  if (a.amount < b.amount) return -1;
  if (a.amount > b.amount) return 1;
  return 0;
}

/**
 * Check if money amount is zero
 */
export function isZeroMoney(money: Money): boolean {
  return money.amount === 0;
}

/**
 * Check if money amount is positive
 */
export function isPositiveMoney(money: Money): boolean {
  return money.amount > 0;
}

/**
 * Check if money amount is negative
 */
export function isNegativeMoney(money: Money): boolean {
  return money.amount < 0;
}

/**
 * Get absolute value of money
 */
export function absoluteMoney(money: Money): Money {
  return createMoney(Math.abs(money.amount), money.currency);
}

/**
 * Round to specified decimal places
 */
export function roundToDecimal(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate service fee (platform commission)
 */
export function calculateServiceFee(
  subtotal: Money,
  feePercentage: number = 10
): Money {
  return percentageOfMoney(subtotal, feePercentage);
}

/**
 * Calculate taxes
 */
export function calculateTax(
  amount: Money,
  taxRate: number
): Money {
  return percentageOfMoney(amount, taxRate);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Parse money from string
 */
export function parseMoney(value: string, currency: Currency): Money {
  // Remove currency symbols and commas
  const cleanValue = value.replace(/[^\d.-]/g, '');
  const amount = parseFloat(cleanValue);

  if (isNaN(amount)) {
    throw new Error(`Invalid money value: ${value}`);
  }

  return createMoney(amount, currency);
}

/**
 * Split money into parts (useful for multi-currency or split payments)
 */
export function splitMoney(money: Money, parts: number): Money[] {
  if (parts <= 0) {
    throw new Error('Number of parts must be positive');
  }

  const perPart = money.amount / parts;
  const decimals = CURRENCY_DECIMALS[money.currency] || 2;

  const result: Money[] = [];
  let total = 0;

  for (let i = 0; i < parts - 1; i++) {
    const rounded = roundToDecimal(perPart, decimals);
    result.push(createMoney(rounded, money.currency));
    total += rounded;
  }

  // Last part gets the remainder to ensure exact total
  result.push(createMoney(money.amount - total, money.currency));

  return result;
}
