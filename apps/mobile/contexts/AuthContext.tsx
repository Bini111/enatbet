import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Centralized role type - keep in sync with backend/Firestore rules
export type UserRole = 'guest' | 'host' | 'admin';

// User data stored in Firestore
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  profileComplete: boolean;
  emailVerified: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

// Auth context state and methods
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isInitializing: boolean;      // True until first auth state resolves
  isAuthenticating: boolean;    // True during sign-in/sign-up/sign-out
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Runtime validation for Firestore user data
function validateUserData(uid: string, data: Record<string, unknown>): UserData {
  const validRoles: UserRole[] = ['guest', 'host', 'admin'];
  const role = validRoles.includes(data.role as UserRole) 
    ? (data.role as UserRole) 
    : 'guest';

  return {
    uid,
    email: typeof data.email === 'string' ? data.email : null,
    displayName: typeof data.displayName === 'string' ? data.displayName : null,
    role,
    profileComplete: typeof data.profileComplete === 'boolean' ? data.profileComplete : false,
    emailVerified: typeof data.emailVerified === 'boolean' ? data.emailVerified : false,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Fetch and validate user data from Firestore
  const fetchUserData = async (uid: string): Promise<UserData | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        console.warn('[AuthContext] User document not found for uid:', uid);
        return null;
      }

      const data = userDoc.data();
      return validateUserData(uid, data);
    } catch (error) {
      console.error('[AuthContext] Error fetching user data:', error);
      return null;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const data = await fetchUserData(firebaseUser.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail || !password) {
      throw new Error('Please enter both email and password.');
    }

    setIsAuthenticating(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const data = await fetchUserData(credential.user.uid);
      setUserData(data);
    } catch (error: unknown) {
      console.error('[AuthContext] Sign in error:', error);
      // Generic message to prevent user enumeration
      throw new Error(getSignInErrorMessage(error));
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = displayName.trim();
    
    if (!trimmedEmail || !password || !trimmedName) {
      throw new Error('Please fill in all fields.');
    }

    if (trimmedName.length < 2) {
      throw new Error('Name must be at least 2 characters.');
    }

    setIsAuthenticating(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const firebaseUser = credential.user;

      // Update display name in Firebase Auth
      await updateProfile(firebaseUser, { displayName: trimmedName });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: trimmedName,
        role: 'guest' as UserRole,
        profileComplete: false,
        emailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Fetch the created document to get real Timestamps (not FieldValue)
      const data = await fetchUserData(firebaseUser.uid);
      setUserData(data);
    } catch (error: unknown) {
      console.error('[AuthContext] Sign up error:', error);
      throw new Error(getSignUpErrorMessage(error));
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setIsAuthenticating(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error: unknown) {
      console.error('[AuthContext] Sign out error:', error);
      throw new Error('Failed to sign out. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      throw new Error('Please enter your email address.');
    }

    setIsAuthenticating(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
    } catch (error: unknown) {
      console.error('[AuthContext] Password reset error:', error);
      throw new Error(getResetPasswordErrorMessage(error));
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Refresh user data from Firestore
  const refreshUserData = async () => {
    if (!user) {
      console.warn('[AuthContext] refreshUserData called without authenticated user');
      return;
    }
    
    const data = await fetchUserData(user.uid);
    setUserData(data);
  };

  // Derived state: user is authenticated if Firebase user exists
  // Note: userData may still be null if Firestore doc is missing
  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    userData,
    isInitializing,
    isAuthenticating,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper to safely get error code from Firebase errors
function getErrorCode(error: unknown): string | null {
  if (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  ) {
    return (error as { code: string }).code;
  }
  return null;
}

// Sign-in errors - generic to prevent user enumeration
function getSignInErrorMessage(error: unknown): string {
  const code = getErrorCode(error);
  
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support for help.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    // Generic message for security - don't reveal if email exists
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    default:
      return 'Invalid email or password. Please try again.';
  }
}

// Sign-up errors - more specific since user is creating account
function getSignUpErrorMessage(error: unknown): string {
  const code = getErrorCode(error);
  
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try signing in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Account creation is currently disabled.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Failed to create account. Please try again.';
  }
}

// Password reset errors
function getResetPasswordErrorMessage(error: unknown): string {
  const code = getErrorCode(error);
  
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    // Don't reveal if email exists for security
    case 'auth/user-not-found':
    default:
      return 'If an account exists with this email, a reset link has been sent.';
  }
}

export default AuthContext;
