import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Enatbet',
  slug: 'enatbet-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './src/assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FF385C',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.enatbet.app',
    buildNumber: '1.0.0',
    infoPlist: {
      NSPhotoLibraryUsageDescription: 'Upload property photos',
      NSCameraUsageDescription: 'Take property photos',
      NSLocationWhenInUseUsageDescription: 'Show nearby properties',
      NSCalendarsUsageDescription: 'Sync your bookings',
    },
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_IOS_MAPS_KEY,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/images/adaptive-icon.png',
      backgroundColor: '#FF385C',
    },
    package: 'com.enatbet.app',
    versionCode: 1,
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'CAMERA',
      'READ_MEDIA_IMAGES',
      'NOTIFICATIONS',
    ],
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_ANDROID_MAPS_KEY,
      },
    },
  },
  web: {
    favicon: './src/assets/images/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-apple-authentication',
    [
      'expo-image-picker',
      {
        photosPermission: 'Upload property photos',
        cameraPermission: 'Take property photos',
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUseUsageDescription: 'Show nearby properties',
      },
    ],
    [
      'expo-calendar',
      {
        calendarPermission: 'Sync your bookings',
      },
    ],
    [
      'expo-notifications',
      {
        color: '#FF385C',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: '34.0.0',
        },
        ios: {
          deploymentTarget: '15.4',
          useFrameworks: 'static',
        },
      },
    ],
  ],
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  updates: {
    enabled: true,
    fallbackToCacheTimeout: 0,
  },
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
  },
});