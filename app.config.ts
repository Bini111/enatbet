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
  scheme: ['com.enatbet.app', 'exp+enatbet-app'],
  deepLinking: {
    enabled: true,
    prefixes: ['com.enatbet.app://', 'exp+enatbet-app://', 'https://enatbet.app'],
    config: {
      screens: {
        '(auth)/login': 'auth/login',
        '(auth)/signup': 'auth/signup',
        '(auth)/reset-password': 'auth/reset-password',
        '(app)/home': 'home',
        '(app)/listing/:id': 'listing/:id',
        '(app)/booking/:id': 'booking/:id',
        '(app)/messages': 'messages',
        '(app)/profile': 'profile',
        notFound: '*',
      },
    },
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.enatbet.app',
    buildNumber: '1',
    deploymentTarget: '15.4',
    usesNonExemptEncryption: false,
    infoPlist: {
      NSPhotoLibraryUsageDescription: 'Upload property photos',
      NSCameraUsageDescription: 'Take property photos',
      NSLocationWhenInUseUsageDescription: 'Show nearby properties',
      NSCalendarsFullAccessUsageDescription: 'Sync your bookings',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'Show nearby properties',
      NSLocalNetworkUsageDescription: 'Connect to local network services',
      NSBonjourServices: ['_http._tcp', '_https._tcp'],
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
    },
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_IOS_MAPS_KEY,
      usesNonExemptEncryption: false,
    },
    associatedDomains: ['applinks:enatbet.app'],
    entitlements: {
      'aps-environment': 'production',
      'com.apple.developer.associated-domains': ['applinks:enatbet.app'],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/images/adaptive-icon.png',
      backgroundColor: '#FF385C',
    },
    package: 'com.enatbet.app',
    versionCode: 1,
    minSdkVersion: 24,
    targetSdkVersion: 34,
    intentFilters: [
      {
        action: 'android.intent.action.VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'enatbet.app',
            pathPrefix: '/',
          },
        ],
        category: ['android.intent.category.DEFAULT', 'android.intent.category.BROWSABLE'],
      },
    ],
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'CAMERA',
      'READ_MEDIA_IMAGES',
      'NOTIFICATIONS',
      'INTERNET',
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
        isIosOnly: false,
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
        icon: './src/assets/images/notification-icon.png',
        sounds: ['./src/assets/sounds/notification.wav'],
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: '34.0.0',
          usesCleartextTraffic: false,
          networkSecurityConfig: './android/network_security_config.xml',
        },
        ios: {
          deploymentTarget: '15.4',
          useFrameworks: 'static',
          useModernBuildSystem: true,
          newArchEnabled: false,
        },
      },
    ],
    // Sentry plugin enabled (React Native / Expo)
    [
      'sentry-expo',
      {
        organization: 'enatbet',
        project: 'enatbet-mobile',
      },
    ],
  ],
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 3000,
    url: `https://updates.expo.dev/${process.env.EXPO_PUBLIC_EAS_PROJECT_ID}`,
  },
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
  },
});
