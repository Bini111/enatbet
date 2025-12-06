/**
 * Server-side business configuration
 * Load from environment variables - never bundle to client
 * Uses lazy initialization to avoid build-time errors
 */

import 'server-only';

export interface BusinessConfig {
  platformFeeRate: number;   // 0..1 (e.g., 0.15 = 15%)
  taxRate: number;           // 0..1 (e.g., 0.10 = 10%)
  minBookingAmount: number;  // major units (e.g., 10 = $10 USD)
}

let _config: BusinessConfig | null = null;

/**
 * Get business configuration - lazily initialized
 * Only validates at runtime when actually called
 */
export function getBusinessConfig(): BusinessConfig {
  if (_config) return _config;

  const platformFeeRate = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '0.15');
  const taxRate = parseFloat(process.env.TAX_RATE || '0.10');
  const minBookingAmount = parseFloat(process.env.MIN_BOOKING_AMOUNT || '10');

  _config = {
    platformFeeRate: isNaN(platformFeeRate) ? 0.15 : platformFeeRate,
    taxRate: isNaN(taxRate) ? 0.10 : taxRate,
    minBookingAmount: isNaN(minBookingAmount) ? 10 : minBookingAmount,
  };

  return _config;
}

export default getBusinessConfig;
