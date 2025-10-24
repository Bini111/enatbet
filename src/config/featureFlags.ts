// src/utils/featureFlags.ts
import Constants from 'expo-constants';

/**
 * Feature flags for runtime capability detection
 * EXPO_PUBLIC_FEATURE_NATIVE=0 -> Expo Go preview mode (mocks)
 * EXPO_PUBLIC_FEATURE_NATIVE=1 -> Dev build with native modules
 */

const FEATURE_NATIVE =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_FEATURE_NATIVE ||
  process.env.EXPO_PUBLIC_FEATURE_NATIVE ||
  '0';

export const featureFlags = {
  isNativeEnabled: FEATURE_NATIVE === '1',
  useRealPayments: FEATURE_NATIVE === '1',
  useNativeMaps: FEATURE_NATIVE === '1',
  usePushNotifications: FEATURE_NATIVE === '1',
};

export const isExpoGo = !featureFlags.isNativeEnabled;

export default featureFlags;
