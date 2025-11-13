/**
 * Server-side business configuration
 * Load from environment variables - never bundle to client
 * 
 * CRITICAL: This file uses 'server-only' to prevent accidental client imports
 * USAGE: Import and call getBusinessConfig() once at server bootstrap
 */

import 'server-only';

export interface BusinessConfig {
  platformFeeRate: number;   // 0..1 (e.g., 0.15 = 15%)
  taxRate: number;           // 0..1 (e.g., 0.10 = 10%)
  minBookingAmount: number;  // major units (e.g., 10 = $10 USD)
}

const inProd = process.env.NODE_ENV === 'production';
const DEBUG_CONFIG = process.env.DEBUG_CONFIG === '1';

/**
 * Assert percentage is valid (0..1)
 * Fails hard in production if missing or malformed
 */
const assertPercent = (name: string, def: number): number => {
  const raw = process.env[name];
  if (raw == null || raw === '') {
    if (inProd) throw new Error(`[CONFIG] Missing required env: ${name}`);
    if (DEBUG_CONFIG) console.warn(`[CONFIG] ${name} defaulting to ${def}`);
    return def;
  }
  const n = Number(raw.trim());
  if (!Number.isFinite(n) || n < 0 || n > 1) {
    throw new Error(`[CONFIG] ${name} must be 0..1, got "${raw}"`);
  }
  return n;
};

/**
 * Assert positive number
 * Fails hard in production if missing or malformed
 */
const assertPositive = (name: string, def: number): number => {
  const raw = process.env[name];
  if (raw == null || raw === '') {
    if (inProd) throw new Error(`[CONFIG] Missing required env: ${name}`);
    if (DEBUG_CONFIG) console.warn(`[CONFIG] ${name} defaulting to ${def}`);
    return def;
  }
  const n = Number(raw.trim());
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`[CONFIG] ${name} must be > 0, got "${raw}"`);
  }
  return n;
};

// Memoized config - validated once
let cached: BusinessConfig | null = null;

/**
 * Get all business configuration (single entry point)
 * 
 * Call this once at server bootstrap to validate all env vars.
 * Do not import individual getters - always use this function.
 * 
 * TAX_RATE WARNING:
 * This is a simplified global tax rate for MVP only.
 * For production, implement jurisdiction-specific tax calculation using:
 * - Stripe Tax Calculations API: https://docs.stripe.com/tax/calculations
 * - Stripe Tax Settings API: https://docs.stripe.com/tax/settings-api
 * - Or TaxJar/Avalara integration
 * 
 * @returns Validated business configuration
 */
export const getBusinessConfig = (): BusinessConfig => {
  if (cached) return cached;
  
  cached = {
    platformFeeRate: assertPercent('PLATFORM_FEE_PERCENTAGE', 0.15),
    taxRate: assertPercent('TAX_RATE', 0.10),
    minBookingAmount: assertPositive('MIN_BOOKING_AMOUNT_MAJOR', 10),
  };
  
  return cached;
};

/**
 * Eager validation in production
 * Fails fast at module load if env vars are misconfigured
 * No success logging to keep serverless logs clean
 */
if (inProd) {
  getBusinessConfig();
}
