/**
 * Firebase Client SDK for browser/client-side operations
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  type User,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (client-side)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Export Firebase instances
export { app, auth, db, storage };

// Re-export onAuthStateChanged
export { onAuthStateChanged } from 'firebase/auth';

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    console.error('[FIREBASE] Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Create a new user account
 */
export async function createUser(
  email: string,
  password: string,
  displayName: string
) {
  try {
    // Create auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      displayName,
      role: 'guest',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      emailVerified: false,
      profileComplete: false,
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);

    return { ...userDoc, uid: user.uid, email: user.email! };
  } catch (error: any) {
    console.error('[FIREBASE] Create user error:', error);
    throw new Error(error.message || 'Failed to create account');
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('[FIREBASE] Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

/**
 * Get current user data from Firestore
 */
export async function getCurrentUser(uid: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      console.warn('[FIREBASE] User document not found:', uid);
      return null;
    }

    return {
      uid,
      ...userDoc.data(),
    };
  } catch (error: any) {
    console.error('[FIREBASE] Get user error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function getCurrentAuthUser(): User | null {
  return auth.currentUser;
}

/**
 * Wait for auth to initialize
 */
export function waitForAuth(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = firebaseOnAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export default app;