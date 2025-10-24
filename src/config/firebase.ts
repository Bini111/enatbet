import analytics from '@react-native-firebase/analytics';
import { getApp, getApps, initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import storage from '@react-native-firebase/storage';
import Constants from 'expo-constants';

/**
 * Firebase Configuration
 *
 * This file initializes all Firebase services used in the app.
 * Make sure all required environment variables are set in .env files.
 */

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration
const validateFirebaseConfig = () => {
  const requiredKeys = ['apiKey', 'projectId', 'appId'];
  const missingKeys = requiredKeys.filter(
    key => !firebaseConfig[key as keyof typeof firebaseConfig],
  );

  if (missingKeys.length > 0) {
    console.error('Missing Firebase configuration keys:', missingKeys);
    throw new Error(`Firebase configuration incomplete. Missing: ${missingKeys.join(', ')}`);
  }
};

// Initialize Firebase only once
let app;
if (getApps().length === 0) {
  validateFirebaseConfig();
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize services
const firebaseAuth = auth();
const firebaseFirestore = firestore();
const firebaseStorage = storage();
const firebaseAnalytics = analytics();
const firebaseCrashlytics = crashlytics();
const firebaseFunctions = functions();

// Configure Firestore settings
firebaseFirestore.settings({
  cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
  persistence: true,
});

// Enable Crashlytics collection
firebaseCrashlytics.setCrashlyticsCollectionEnabled(true);

// Configure Functions region if needed
// firebaseFunctions.useFunctionsEmulator('http://localhost:5001'); // For local development

export {
  firebaseAnalytics as analytics,
  firebaseAuth as auth,
  firebaseCrashlytics as crashlytics,
  firebaseFirestore as firestore,
  firebaseFunctions as functions,
  firebaseStorage as storage,
};

export default app;
