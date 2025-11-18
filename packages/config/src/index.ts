export const config = {
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  platformFeePercentage: parseInt(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE || '10'),
  currency: process.env.NEXT_PUBLIC_CURRENCY || 'USD',
};
