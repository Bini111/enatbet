import { create } from 'zustand';
import { auth, signIn, signOut, createUser, getCurrentUser, onAuthStateChanged } from '../lib/firebase';

interface AuthState {
  user: any | null;
  isLoading: boolean;
  error: string | null;
  
  initializeAuth: () => void;
  signInUser: (email: string, password: string) => Promise<void>;
  signUpUser: (email: string, password: string, displayName: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  initializeAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await getCurrentUser(firebaseUser.uid);
        set({ user, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    });
  },

  signInUser: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await signIn(email, password);
      const user = await getCurrentUser(result.user.uid);
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signUpUser: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await createUser(email, password, displayName);
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signOutUser: async () => {
    set({ isLoading: true });
    try {
      await signOut();
      set({ user: null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
