import { create } from "zustand";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phone?: string;
  bio?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  role?: string;
  isHost?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  initializeAuth: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const mapFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  let extendedData: any = {};
  try {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    if (userDoc.exists()) {
      extendedData = userDoc.data();
    } else {
      console.warn("[AuthStore] User document not found for uid:", firebaseUser.uid);
    }
  } catch (error) {
    console.warn("[AuthStore] Could not fetch extended user data:", error);
  }

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: extendedData.displayName || firebaseUser.displayName,
    photoURL: extendedData.photoURL || firebaseUser.photoURL,
    phone: extendedData.phone,
    bio: extendedData.bio,
    instagramUrl: extendedData.instagramUrl,
    twitterUrl: extendedData.twitterUrl,
    role: extendedData.role,
    isHost: extendedData.isHost || extendedData.role === 'host',
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initializeAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await mapFirebaseUser(firebaseUser);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("[AuthStore] Error mapping user:", error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
  },

  refreshUser: async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const user = await mapFirebaseUser(currentUser);
      set({ user });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      const user = await mapFirebaseUser(firebaseUser);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      console.error("[AuthStore] Sign in error:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true, error: null });
    try {
      // Step 1: Create Firebase Auth account
      console.log("[AuthStore] Creating Firebase Auth account...");
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      console.log("[AuthStore] Auth account created, uid:", firebaseUser.uid);
      
      // Step 2: Update display name in Auth
      await updateProfile(firebaseUser, { displayName });
      console.log("[AuthStore] Display name updated");
      
      // Step 3: Create user document in Firestore
      const now = Timestamp.now();
      
      const userData = {
        email: email,
        displayName: displayName,
        role: "guest",
        createdAt: now,
        updatedAt: now,
      };
      
      console.log("[AuthStore] Creating Firestore user document...");
      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      console.log("[AuthStore] User document created successfully!");

      // Step 4: Map and set user state
      const user = await mapFirebaseUser(firebaseUser);
      set({ user, isAuthenticated: true, isLoading: false });
      
      console.log("[AuthStore] Sign up complete!");
    } catch (error: any) {
      console.error("[AuthStore] Sign up error:", error.code, error.message);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await firebaseSignOut(auth);
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      console.error("[AuthStore] Sign out error:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email);
      set({ isLoading: false });
    } catch (error: any) {
      console.error("[AuthStore] Reset password error:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
