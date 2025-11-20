import { initializeApp, getApps, getApp } from "firebase/app";
import {
  Auth,
  initializeAuth,
  getReactNativePersistence,
  connectAuthEmulator,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

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
  // Check if auth is already initialized
  const existingAuth = (app as any)._authInstance;
  if (existingAuth) {
    auth = existingAuth;
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    // Store reference to prevent re-initialization
    (app as any)._authInstance = auth;
  }
} catch (error) {
  // If auth is already initialized, get the existing instance
  console.warn("Auth already initialized, using existing instance");
  auth = (app as any)._authInstance;
}

const db = getFirestore(app);
const storage = getStorage(app);

// Add this for development
if (__DEV__) {
  // iOS Simulator uses localhost
  // Android Emulator uses 10.0.2.2
  // Physical devices use your machine's LAN IP (e.g., 192.168.1.x)
  const host = Platform.OS === "android" ? "10.0.2.2" : "localhost";

  connectAuthEmulator(auth, `http://${host}:9099`);
  connectFirestoreEmulator(db, host, 8080);
  connectStorageEmulator(storage, host, 9199);
}

export { app, auth, db, storage };
