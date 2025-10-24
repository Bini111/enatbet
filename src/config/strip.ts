import { initStripe } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';

/**
 * Stripe Configuration
 *
 * Initialize Stripe with your publishable key.
 * NEVER commit your secret key to version control.
 */

const publishableKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.error('Stripe publishable key not found in environment variables');
}

// Initialize Stripe
export const initializeStripe = async () => {
  if (!publishableKey) {
    throw new Error('Stripe publishable key is required');
  }

  await initStripe({
    publishableKey,
    merchantIdentifier: 'merchant.com.enatbet.app', // For Apple Pay
    urlScheme: 'enatbet', // For redirects
    setReturnUrlSchemeOnAndroid: true,
  });
};

export const STRIPE_CONFIG = {
  publishableKey,
  merchantIdentifier: 'merchant.com.enatbet.app',
};
