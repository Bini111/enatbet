import { initializeApp, getApps, getApp } from "firebase/app";
import {
  Auth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Runtime validation of required environment variables
const requiredEnvVars = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validate all required env vars are present
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(
      `Missing required environment variable: EXPO_PUBLIC_FIREBASE_${key.toUpperCase()}\n` +
        `Please check your .env file and ensure all Firebase config is set.`,
    );
  }
}

const firebaseConfig = requiredEnvVars;

// Initialize app only once
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize auth only once with persistence
let auth: Auth;
try {
  const existingAuth = (app as any)._authInstance;
  if (existingAuth) {
    auth = existingAuth;
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    (app as any)._authInstance = auth;
  }
} catch (error) {
  console.warn("Auth already initialized, using existing instance");
  auth = (app as any)._authInstance;
}

const db = getFirestore(app);
const storage = getStorage(app);

// NOTE: Emulator connections disabled for production testing
// To use emulators, uncomment the code below and run:
// firebase emulators:start

export { app, auth, db, storage };
