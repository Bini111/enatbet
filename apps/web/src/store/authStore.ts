'use client';

import { create } from 'zustand';

interface AuthState {
  user: any | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  initializeAuth: () => Promise<void>;
  signInUser: (email: string, password: string) => Promise<void>;
  signUpUser: (email: string, password: string, displayName: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  isInitialized: false,

  initializeAuth: async () => {
    // Only run on client side
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    // Prevent re-initialization
    if (get().isInitialized) {
      return;
    }

    try {
      // Dynamic import to ensure it only loads on client
      const { auth, getCurrentUser, onAuthStateChanged } = await import('../lib/firebase');
      
      if (!auth) {
        console.warn('Firebase auth not available');
        set({ isLoading: false, isInitialized: true });
        return;
      }

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const user = await getCurrentUser(firebaseUser.uid);
          set({ user, isLoading: false, isInitialized: true });
        } else {
          set({ user: null, isLoading: false, isInitialized: true });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false, isInitialized: true, error: 'Failed to initialize auth' });
    }
  },

  signInUser: async (email: string, password: string) => {
    if (typeof window === 'undefined') return;
    
    set({ isLoading: true, error: null });
    try {
      const { signIn, getCurrentUser } = await import('../lib/firebase');
      const result = await signIn(email, password);
      const user = await getCurrentUser(result.user.uid);
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signUpUser: async (email: string, password: string, displayName: string) => {
    if (typeof window === 'undefined') return;
    
    set({ isLoading: true, error: null });
    try {
      const { createUser } = await import('../lib/firebase');
      const user = await createUser(email, password, displayName);
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signOutUser: async () => {
    if (typeof window === 'undefined') return;
    
    set({ isLoading: true });
    try {
      const { signOut } = await import('../lib/firebase');
      await signOut();
      set({ user: null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
