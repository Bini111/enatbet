/**
 * Firebase Admin SDK for server-side operations
 * Server-only - never import in client code
 */

import 'server-only';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;
let db: Firestore;
let auth: Auth;

// Initialize Firebase Admin
if (getApps().length === 0) {
  // Production: use service account from environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      );
      
      app = initializeApp({
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
    // Production without service account - fail hard
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY is required in production. ' +
      'Generate a service account key from Firebase Console > Project Settings > Service Accounts'
    );
  } else {
    // Development: use application default credentials or emulator
    console.warn('[FIREBASE_ADMIN] Using default credentials (development only)');
    app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
    });
  }
  
  db = getFirestore(app);
  auth = getAuth(app);
  
  // Set Firestore settings for production
  if (process.env.NODE_ENV === 'production') {
    db.settings({
      ignoreUndefinedProperties: true,
    });
  }
} else {
  app = getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
}

export { 
  app, 
  db, 
  auth,
  db as adminDb, 
  auth as adminAuth 
};
export const adminStorage = () => {
  throw new Error('Storage not yet implemented');
};
export default app;