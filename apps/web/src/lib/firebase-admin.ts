/**
 * Firebase Admin SDK for server-side operations
 * Server-only - never import in client code
 * Uses lazy initialization to avoid build-time errors
 */

import 'server-only';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _initialized = false;

function initializeFirebaseAdmin() {
  if (_initialized) return;
  
  if (getApps().length > 0) {
    _app = getApps()[0];
    _db = getFirestore(_app);
    _auth = getAuth(_app);
    _initialized = true;
    return;
  }

  // Production: use service account from environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      
      _app = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
      });
      
      console.log('[FIREBASE_ADMIN] Initialized with service account');
    } catch (error) {
      console.error('[FIREBASE_ADMIN] Failed to parse service account:', error);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY');
    }
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is required in production');
  } else {
    // Development: use default credentials or emulator
    _app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'enatbet-906c4',
    });
    console.log('[FIREBASE_ADMIN] Initialized for development');
  }

  _db = getFirestore(_app!);
  _auth = getAuth(_app!);
  _initialized = true;
}

// Lazy getters
export const db = {
  get collection() {
    initializeFirebaseAdmin();
    return _db!.collection.bind(_db!);
  }
} as unknown as Firestore;

export const auth = {
  get verifyIdToken() {
    initializeFirebaseAdmin();
    return _auth!.verifyIdToken.bind(_auth!);
  },
  get getUser() {
    initializeFirebaseAdmin();
    return _auth!.getUser.bind(_auth!);
  },
  get createUser() {
    initializeFirebaseAdmin();
    return _auth!.createUser.bind(_auth!);
  },
} as unknown as Auth;

export const adminDb = db;
export const adminAuth = auth;

// Export a function to get the actual instances when needed
export function getAdminFirestore(): Firestore {
  initializeFirebaseAdmin();
  return _db!;
}

export function getAdminAuth(): Auth {
  initializeFirebaseAdmin();
  return _auth!;
}

// Stub for storage (not implemented)
export const adminStorage = () => {
  throw new Error('Admin storage not implemented');
};
