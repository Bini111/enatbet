import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Enatbet",
  slug: "enatbet",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  scheme: "enatbet",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#E91E63",
  },
  platforms: ["ios", "android"],
  assetBundlePatterns: ["**/*"],

  ios: {
    supportsTablet: true,
    bundleIdentifier: "app.enatbet.mobile",
    buildNumber: "1",
    infoPlist: {
      NSCameraUsageDescription:
        "Enatbet needs camera access to upload property photos",
      NSPhotoLibraryUsageDescription:
        "Enatbet needs photo library access to select property images",
      NSLocationWhenInUseUsageDescription:
        "Enatbet uses your location to show nearby properties",
      UIBackgroundModes: ["remote-notification"],
    },
    associatedDomains: ["applinks:enatbet.app"],
    googleServicesFile: "./GoogleService-Info.plist",
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#E91E63",
    },
    package: "app.enatbet.mobile",
    versionCode: 1,
    permissions: [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "ACCESS_COARSE_LOCATION", // Using coarse instead of fine for privacy
    ],
    googleServicesFile: "./google-services.json",
  },

  plugins: [
    "expo-router",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
        },
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: "34.0.0",
        },
      },
    ],
    // Firebase JS SDK (Web-based) - NO @react-native-firebase plugins
    // If you switch to @react-native-firebase/*, uncomment these:
    // '@react-native-firebase/app',
    // '@react-native-firebase/auth',
    // '@react-native-firebase/firestore',
    // '@react-native-firebase/storage',
  ],

  extra: {
    eas: {
      projectId:
        process.env.EXPO_PUBLIC_EAS_PROJECT_ID || "your-eas-project-id",
    },
    // Use environment variables for all keys
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://enatbet.app",
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  },

  updates: {
    url: `https://u.expo.dev/${process.env.EXPO_PUBLIC_EAS_PROJECT_ID || "your-eas-project-id"}`,
  },

  runtimeVersion: {
    policy: "appVersion",
  },
});
