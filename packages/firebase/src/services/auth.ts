import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User } from '@enatebet/shared';

/**
 * Authentication Service
 * Handles user signup, login, logout, and profile management
 */

// Convert Firebase user to our User type
const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  const userData = userDoc.data();

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || '',
    photoURL: firebaseUser.photoURL || undefined,
    phoneNumber: firebaseUser.phoneNumber || undefined,
    role: userData?.role || 'guest',
    status: userData?.status || 'active',
    emailVerified: firebaseUser.emailVerified,
    createdAt: userData?.createdAt?.toDate() || new Date(),
    updatedAt: userData?.updatedAt?.toDate() || new Date(),
    profile: userData?.profile || {
      languages: ['en'],
      verifications: {
        email: firebaseUser.emailVerified,
        phone: false,
        identity: false,
        payment: false,
      },
    },
  };
};

// Sign up new user
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    // Create Firebase auth user
    const credential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name
    await updateProfile(credential.user, { displayName });

    // Create Firestore user document
    const userData = {
      email,
      displayName,
      role: 'guest',
      status: 'active',
      emailVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      profile: {
        languages: ['en'],
        verifications: {
          email: false,
          phone: false,
          identity: false,
          payment: false,
        },
      },
    };

    await setDoc(doc(db, 'users', credential.user.uid), userData);

    return convertFirebaseUser(credential.user);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak');
    }
    throw new Error(error.message || 'Failed to create account');
  }
};

// Sign in existing user
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login
    await updateDoc(doc(db, 'users', credential.user.uid), {
      'profile.lastLoginAt': serverTimestamp(),
    });

    return convertFirebaseUser(credential.user);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Invalid email or password');
    }
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;
  
  return convertFirebaseUser(firebaseUser);
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<User['profile']>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      profile: updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

// Become a host
export const becomeHost = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: 'both', // Can be both guest and host
      'profile.hostStats': {
        totalListings: 0,
        totalBookings: 0,
        rating: 0,
        responseRate: 0,
        responseTime: 0,
        superhost: false,
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to become host');
  }
};
