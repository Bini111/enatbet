import type { CurrencyInfo } from '../constants/currencies';

export const MoneyUtils = {
  toMinorUnits(major: number, currency: CurrencyInfo): number {
    const factor = Math.pow(10, currency.minorUnit);
    return Math.round(major * factor);
  },

  fromMinorUnits(minor: number, currency: CurrencyInfo): number {
    const factor = Math.pow(10, currency.minorUnit);
    return minor / factor;
  },

  formatMinor(minor: number, currency: CurrencyInfo, locale = 'en-US'): string {
    const major = MoneyUtils.fromMinorUnits(minor, currency);
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.code,
    }).format(major);
  },
};
