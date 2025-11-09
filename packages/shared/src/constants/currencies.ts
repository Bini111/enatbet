export type CurrencyCode = 'USD' | 'CAD' | 'EUR' | 'GBP' | 'ETB';

export interface CurrencyInfo {
  code: CurrencyCode;
  minorUnit: number;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', minorUnit: 2 },
  CAD: { code: 'CAD', minorUnit: 2 },
  EUR: { code: 'EUR', minorUnit: 2 },
  GBP: { code: 'GBP', minorUnit: 2 },
  ETB: { code: 'ETB', minorUnit: 2 },
};
