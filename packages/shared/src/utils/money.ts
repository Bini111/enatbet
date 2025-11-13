/**
 * Money Utilities - Enatebet Platform
 * Stripe-compatible currency conversion and formatting
 */

import { SupportedCurrency } from '../types/domain';

/**
 * Currency metadata for Stripe compatibility
 * zero-decimal currencies: amounts are already in the smallest unit (e.g., JPY, KRW)
 * standard currencies: 2 decimal places (USD, EUR, GBP, etc.)
 * 3-decimal currencies: 3 decimal places (e.g., KWD, BHD)
 */
const CURRENCY_CONFIG: Record<SupportedCurrency, { decimals: number }> = {
  USD: { decimals: 2 }, // cents
  CAD: { decimals: 2 }, // cents
  EUR: { decimals: 2 }, // cents
  GBP: { decimals: 2 }, // pence
  ETB: { decimals: 2 }, // santim
};

export class MoneyUtils {
  /**
   * Convert currency amount to minor units (for Stripe)
   * e.g., $10.50 USD -> 1050 cents
   * e.g., 100 ETB -> 10000 santim
   */
  static toMinorUnits(amount: number, currency: SupportedCurrency): number {
    const config = CURRENCY_CONFIG[currency];
    if (!config) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    const multiplier = Math.pow(10, config.decimals);
    return Math.round(amount * multiplier);
  }

  /**
   * Convert from minor units to major units
   * e.g., 1050 cents -> $10.50 USD
   * e.g., 10000 santim -> 100 ETB
   */
  static fromMinorUnits(amountMinor: number, currency: SupportedCurrency): number {
    const config = CURRENCY_CONFIG[currency];
    if (!config) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    const divisor = Math.pow(10, config.decimals);
    return amountMinor / divisor;
  }

  /**
   * Format minor units as currency string
   * e.g., 1050 cents USD -> "$10.50"
   * e.g., 10000 santim ETB -> "ETB 100.00"
   */
  static formatMinor(
    amountMinor: number,
    currency: SupportedCurrency,
    locale: string = 'en-US'
  ): string {
    const majorAmount = this.fromMinorUnits(amountMinor, currency);
    return this.format(majorAmount, currency, locale);
  }

  /**
   * Format major units as currency string
   * e.g., 10.50 USD -> "$10.50"
   * e.g., 100 ETB -> "ETB 100.00"
   */
  static format(
    amount: number,
    currency: SupportedCurrency,
    locale: string = 'en-US'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: CURRENCY_CONFIG[currency].decimals,
      maximumFractionDigits: CURRENCY_CONFIG[currency].decimals,
    }).format(amount);
  }

  /**
   * Get currency symbol
   * e.g., USD -> "$", EUR -> "€", ETB -> "ETB"
   */
  static getSymbol(currency: SupportedCurrency, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(0)
      .replace(/\d/g, '')
      .trim();
  }

  /**
   * Calculate service fee (platform commission)
   * Default: 15% of subtotal
   */
  static calculateServiceFee(subtotal: number, feePercent: number = 15): number {
    return Math.round(subtotal * (feePercent / 100));
  }

  /**
   * Calculate taxes (simplified - would vary by location in production)
   * Default: 10% of subtotal
   */
  static calculateTaxes(subtotal: number, taxPercent: number = 10): number {
    return Math.round(subtotal * (taxPercent / 100));
  }

  /**
   * Calculate total booking price
   */
  static calculateBookingTotal(params: {
    basePrice: number;
    nights: number;
    cleaningFee: number;
    serviceFeePercent?: number;
    taxPercent?: number;
    currency: SupportedCurrency;
  }): {
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
    currency: SupportedCurrency;
  } {
    const { basePrice, nights, cleaningFee, serviceFeePercent = 15, taxPercent = 10, currency } = params;

    const subtotal = basePrice * nights;
    const serviceFee = this.calculateServiceFee(subtotal, serviceFeePercent);
    const taxes = this.calculateTaxes(subtotal + cleaningFee + serviceFee, taxPercent);
    const total = subtotal + cleaningFee + serviceFee + taxes;

    return {
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      total,
      currency,
    };
  }

  /**
   * Parse currency string to number
   * e.g., "$10.50" -> 10.50
   * e.g., "ETB 100" -> 100
   */
  static parse(currencyString: string): number | null {
    const cleaned = currencyString.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Validate currency amount
   */
  static isValid(amount: number, currency: SupportedCurrency): boolean {
    if (typeof amount !== 'number' || isNaN(amount)) return false;
    if (amount < 0) return false;

    // Check if amount has too many decimal places
    const decimals = CURRENCY_CONFIG[currency].decimals;
    const multiplier = Math.pow(10, decimals);
    const rounded = Math.round(amount * multiplier) / multiplier;

    return Math.abs(amount - rounded) < 0.00001;
  }
}

/**
 * Calculate booking price (legacy export for compatibility)
 */
export const calculateBookingPrice = MoneyUtils.calculateBookingTotal;
