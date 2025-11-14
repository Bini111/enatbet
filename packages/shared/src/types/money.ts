/**
 * Money and Currency Types
 */

export interface Money {
  amount: number;
  currency: Currency;
}

export type Currency = 'ETB' | 'USD' | 'EUR' | 'GBP';

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  lastUpdated: Date;
}

export interface PriceBreakdown {
  subtotal: Money;
  cleaningFee: Money;
  serviceFee: Money;
  taxes: Money;
  total: Money;
  discounts?: Discount[];
}

export interface Discount {
  type: DiscountType;
  amount: Money;
  code?: string;
  description: string;
}

export type DiscountType = 'weekly' | 'monthly' | 'early_bird' | 'last_minute' | 'promo_code';

export interface CurrencyFormatOptions {
  locale?: string;
  showSymbol?: boolean;
  showCode?: boolean;
  decimals?: number;
}
