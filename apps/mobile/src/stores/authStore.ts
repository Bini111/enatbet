import { create } from "zustand";
import { User } from "@enatbet/shared";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { getUserById } from "@enatbet/firebase";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: (userId: string) => Promise<void>;
  initialize: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: () => {
    if (!auth) {
      console.error("Firebase auth not initialized");
      set({ isLoading: false });
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await getUserById(firebaseUser.uid);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Error loading user:", error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    return unsubscribe;
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      if (!auth) throw new Error("Firebase auth not initialized");
      
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = await getUserById(credential.user.uid);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true, error: null });
    try {
      if (!auth) throw new Error("Firebase auth not initialized");
      
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName });
      const user = await getUserById(credential.user.uid);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!auth) throw new Error("Firebase auth not initialized");
      
      await firebaseSignOut(auth);
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  loadUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await getUserById(userId);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));