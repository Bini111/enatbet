import { ExpoConfig, ConfigContext } from 'expo/config';

// Validate required environment variables at build time
const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0 && process.env.NODE_ENV !== 'development') {
  console.warn(`⚠️  Missing required environment variables: ${missingVars.join(', ')}`);
}

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
  
  // Deep Linking & Universal Links
  scheme: ['enatbet', 'com.enatbet.app', 'exp+enatbet-app'],
  
  deepLinking: {
    enabled: true,
    prefixes: [
      'enatbet://',
      'com.enatbet.app://',
      'exp+enatbet-app://',
      'https://enatbet.app',
      'https://*.enatbet.app',
    ],
    config: {
      screens: {
        // Auth flows
        '(auth)/login': 'auth/login',
        '(auth)/signup': 'auth/signup',
        '(auth)/reset-password': 'auth/reset-password',
        '(auth)/verify-email': 'auth/verify-email',
        
        // Main app flows
        '(app)/home': 'home',
        '(app)/explore': 'explore',
        '(app)/listing/:id': 'listing/:id',
        '(app)/booking/:id': 'booking/:id',
        '(app)/messages': 'messages',
        '(app)/messages/:chatId': 'messages/:chatId',
        '(app)/profile': 'profile',
        '(app)/profile/edit': 'profile/edit',
        '(app)/profile/settings': 'profile/settings',
        '(app)/profile/bookings': 'profile/bookings',
        '(app)/profile/favorites': 'profile/favorites',
        '(app)/payments': 'payments',
        '(app)/payments/success': 'payments/success',
        '(app)/payments/cancelled': 'payments/cancelled',
        
        // Betting flows (if applicable)
        '(app)/bets': 'bets',
        '(app)/bets/:id': 'bets/:id',
        
        // Legal & Support
        'privacy-policy': 'privacy-policy',
        'terms-of-service': 'terms-of-service',
        'support': 'support',
        
        // Catch-all
        notFound: '*',
      },
    },
  },

  // iOS Configuration
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.enatbet.app',
    buildNumber: '1',
    deploymentTarget: '15.4',
    usesNonExemptEncryption: false,
    
    infoPlist: {
      // Photo & Camera
      NSPhotoLibraryUsageDescription: 'Enatbet needs access to your photo library to upload property photos and profile pictures.',
      NSPhotoLibraryAddUsageDescription: 'Enatbet needs permission to save photos to your library.',
      NSCameraUsageDescription: 'Enatbet needs camera access to take photos of properties and for profile pictures.',
      
      // Location
      NSLocationWhenInUseUsageDescription: 'Enatbet uses your location to show nearby properties and help you find rentals in your area.',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'Enatbet uses your location to provide location-based services and notify you about nearby properties.',
      
      // Calendar
      NSCalendarsFullAccessUsageDescription: 'Enatbet syncs your bookings with your calendar so you never miss a reservation.',
      
      // Notifications
      NSUserNotificationsUsageDescription: 'Enatbet sends you important updates about your bookings, messages, and account activity.',
      
      // Network
      NSLocalNetworkUsageDescription: 'Enatbet connects to local network services to improve app performance.',
      NSBonjourServices: ['_http._tcp', '_https._tcp'],
      
      // Privacy & Tracking
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
      
      // Face ID (if using biometric auth)
      NSFaceIDUsageDescription: 'Enatbet uses Face ID to securely log you in and protect your account.',
      
      // Microphone (if you add video/voice features)
      // NSMicrophoneUsageDescription: 'Enatbet needs microphone access for video calls with property owners.',
      
      // Background modes for notifications
      UIBackgroundModes: [
        'remote-notification',
        'fetch',
      ],
      
      // App Store metadata
      CFBundleDisplayName: 'Enatbet',
      CFBundleShortVersionString: '1.0.0',
      
      // URL scheme registration
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ['enatbet', 'com.enatbet.app'],
          CFBundleURLName: 'com.enatbet.app',
        },
      ],
    },
    
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_IOS_MAPS_KEY,
      usesNonExemptEncryption: false,
    },
    
    associatedDomains: [
      'applinks:enatbet.app',
      'applinks:*.enatbet.app',
    ],
    
    entitlements: {
      'aps-environment': 'production',
      'com.apple.developer.associated-domains': [
        'applinks:enatbet.app',
        'applinks:*.enatbet.app',
      ],
    },
    
    // App Store Metadata
    appStoreUrl: 'https://apps.apple.com/app/enatbet/idXXXXXXXXX', // TODO: Replace with actual App Store ID after first submission
  },

  // Android Configuration
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/images/adaptive-icon.png',
      backgroundColor: '#FF385C',
    },
    package: 'com.enatbet.app',
    versionCode: 1,
    minSdkVersion: 24,
    targetSdkVersion: 34,
    compileSdkVersion: 34,
    
    // Universal Links
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
          {
            scheme: 'https',
            host: '*.enatbet.app',
            pathPrefix: '/',
          },
        ],
        category: ['android.intent.category.DEFAULT', 'android.intent.category.BROWSABLE'],
      },
      // Custom scheme
      {
        action: 'android.intent.action.VIEW',
        data: [
          {
            scheme: 'enatbet',
          },
          {
            scheme: 'com.enatbet.app',
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
      'WRITE_EXTERNAL_STORAGE', // For Android < 10
      'READ_EXTERNAL_STORAGE', // For Android < 10
      'POST_NOTIFICATIONS', // Required for Android 13+
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'VIBRATE',
    ],
    
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_ANDROID_MAPS_KEY,
      },
    },
    
    // Play Store Metadata
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.enatbet.app', // TODO: Update after first submission
  },

  // Web Configuration
  web: {
    favicon: './src/assets/images/favicon.png',
    bundler: 'metro',
    output: 'static',
    // Add meta tags for SEO
    name: 'Enatbet - Property Rentals & More',
    shortName: 'Enatbet',
    description: 'Find and book amazing properties with Enatbet',
    themeColor: '#FF385C',
    backgroundColor: '#FFFFFF',
  },

  // Expo Plugins
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-apple-authentication',
    [
      'expo-image-picker',
      {
        photosPermission: 'Enatbet needs access to your photo library to upload property photos and profile pictures.',
        cameraPermission: 'Enatbet needs camera access to take photos of properties and for profile pictures.',
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUseUsageDescription: 'Enatbet uses your location to show nearby properties and help you find rentals in your area.',
        locationWhenInUseUsageDescription: 'Enatbet uses your location to show nearby properties.',
        isIosOnly: false,
      },
    ],
    [
      'expo-calendar',
      {
        calendarPermission: 'Enatbet syncs your bookings with your calendar so you never miss a reservation.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './src/assets/images/notification-icon.png',
        color: '#FF385C',
        sounds: ['./src/assets/sounds/notification.wav'],
        mode: 'production',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: '34.0.0',
          minSdkVersion: 24,
          usesCleartextTraffic: false,
          networkSecurityConfig: './android/network_security_config.xml',
          enableProguardInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
        },
        ios: {
          deploymentTarget: '15.4',
          useFrameworks: 'static',
          newArchEnabled: false,
        },
      },
    ],
    [
      '@react-native-firebase/app',
      {
        // This enables auto-initialization
      },
    ],
    [
      '@react-native-firebase/crashlytics',
      {
        crashlytics_auto_collection_enabled: true,
        crashlytics_debug: process.env.EXPO_PUBLIC_APP_ENV === 'development',
      },
    ],
    [
      'sentry-expo',
      {
        organization: process.env.SENTRY_ORG || 'enatbet',
        project: process.env.SENTRY_PROJECT || 'enatbet-mobile',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    ],
  ],

  // Over-the-Air Updates
  runtimeVersion: '1.0.0',
  
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 3000,
    url: 'https://u.expo.dev/c31c2cf6-ae8e-4ff3-9be0-3f71ab468a4c',
  },

  // EAS Configuration
  extra: {
    eas: {
      projectId: 'c31c2cf6-ae8e-4ff3-9be0-3f71ab468a4c',
    },
    // API endpoints by environment
    apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.enatbet.app',
    // Feature flags
    enableBetting: process.env.EXPO_PUBLIC_FEATURE_BETTING === 'true',
    enablePayments: process.env.EXPO_PUBLIC_FEATURE_PAYMENTS !== 'false',
    // Links
    privacyPolicyUrl: 'https://enatbet.app/privacy',
    termsOfServiceUrl: 'https://enatbet.app/terms',
    supportUrl: 'https://enatbet.app/support',
    supportEmail: 'support@enatbet.app',
  },

  // Hooks
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          organization: process.env.SENTRY_ORG || 'enatbet',
          project: process.env.SENTRY_PROJECT || 'enatbet-mobile',
          authToken: process.env.SENTRY_AUTH_TOKEN,
        },
      },
    ],
  },
});
