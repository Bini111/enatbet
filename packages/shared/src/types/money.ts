import type { Currency } from '../constants/currencies';

export interface Money {
  amount: number;
  currency: Currency;
}

export interface PriceBreakdown {
  basePrice: Money;
  cleaningFee?: Money;
  serviceFee: Money;
  tax: Money;
  total: Money;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  ETB: 'Br'
};

export const formatMoney = (money: Money): string => {
  const symbol = CURRENCY_SYMBOLS[money.currency];
  return `${symbol}${money.amount.toFixed(2)}`;
};
