// src/utils/format.ts
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { getCurrentLanguage } from '../config/i18n';

/**
 * Currency formatting utilities
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const locale = getCurrentLanguage() === 'am' ? 'am-ET' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPrice = (amount: number): string => {
  return formatCurrency(amount);
};

/**
 * Date formatting utilities with optional timezone support
 */
export const formatDate = (
  date: Date | string,
  formatStr: string = 'MMM d, yyyy',
  options?: { timeZone?: string }
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  // Note: date-fns doesn't directly support timeZone in format options
  // For timezone conversion, use date-fns-tz if needed
  // This implementation uses the system timezone
  return format(dateObj, formatStr, { locale: enUS });
};

export const formatDateRange = (
  startDate: Date | string,
  endDate: Date | string,
  options?: { timeZone?: string }
): string => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
};

export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: enUS });
};

export const formatShortDate = (date: Date | string, options?: { timeZone?: string }): string => {
  return formatDate(date, 'MMM d', options);
};

export const formatFullDate = (date: Date | string, options?: { timeZone?: string }): string => {
  return formatDate(date, 'EEEE, MMMM d, yyyy', options);
};

export const formatTime = (date: Date | string, options?: { timeZone?: string }): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'h:mm a');
};

/**
 * Number formatting utilities
 */
export const formatNumber = (num: number, decimals: number = 0): string => {
  const locale = getCurrentLanguage() === 'am' ? 'am-ET' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Text utilities
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const pluralize = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};