import { initializeApp } from '@react-native-firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getStorage } from '@react-native-firebase/storage';
import { getFunctions } from '@react-native-firebase/functions';
import { getAnalytics } from '@react-native-firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: Constants.expoConfig?.extra?.FIREBASE_MEASUREMENT_ID || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app: any;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

// Initialize Firebase Auth with persistence
let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  console.warn('Firebase Auth already initialized');
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Functions
const functions = getFunctions(app);

// Initialize Analytics (optional)
let analytics: any = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('Analytics not available');
}

// Collection references
export const collections = {
  users: 'users',
  listings: 'listings',
  bookings: 'bookings',
  reviews: 'reviews',
  conversations: 'conversations',
  messages: 'messages',
  wishlists: 'wishlists',
  events: 'events',
  resources: 'resources',
  notifications: 'notifications',
};

// Storage bucket paths
export const storagePaths = {
  profileImages: 'profile-images',
  listingImages: 'listing-images',
  messageImages: 'message-images',
  verificationDocuments: 'verification-documents',
};

// Cloud Function names
export const functionNames = {
  createPaymentIntent: 'createPaymentIntent',
  handlePaymentSuccess: 'handlePaymentSuccess',
  sendNotification: 'sendNotification',
  translateMessage: 'translateMessage',
  calculateSuperhost: 'calculateSuperhost',
  sendBookingReminder: 'sendBookingReminder',
};

// Helper function to get timestamp
export const getTimestamp = () => {
  return new Date();
};

// Helper function to format Firebase timestamp
export const formatFirebaseTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  return new Date(timestamp);
};

// Error messages
export const firebaseErrors: { [key: string]: string } = {
  'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email. Please sign up.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
  'auth/invalid-verification-id': 'Verification expired. Please request a new code.',
  'auth/missing-verification-code': 'Please enter the verification code.',
  'auth/missing-verification-id': 'Verification ID missing. Please try again.',
  'auth/quota-exceeded': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'permission-denied': 'You do not have permission to perform this action.',
  'not-found': 'The requested resource was not found.',
  'already-exists': 'This resource already exists.',
  'resource-exhausted': 'Quota exceeded. Please try again later.',
  'failed-precondition': 'Operation cannot be performed in the current state.',
  'aborted': 'Operation was aborted. Please try again.',
  'out-of-range': 'Operation was attempted past the valid range.',
  'unimplemented': 'This feature is not yet implemented.',
  'internal': 'An internal error occurred. Please try again.',
  'unavailable': 'Service is temporarily unavailable. Please try again later.',
  'data-loss': 'Data loss occurred. Please contact support.',
  'unauthenticated': 'Please sign in to continue.',
};

// Get user-friendly error message
export const getErrorMessage = (error: any): string => {
  const code = error?.code || error?.message || 'unknown-error';
  return firebaseErrors[code] || 'An unexpected error occurred. Please try again.';
};

// Export initialized services
export { app, auth, db, storage, functions, analytics };