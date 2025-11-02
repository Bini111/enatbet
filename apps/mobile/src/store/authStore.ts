import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  firebaseUser: any | null;
  isLoading: boolean;
  error: string | null;
  
  initializeAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUser: null,
  isLoading: false,
  error: null,

  initializeAuth: async () => {
    // TODO: Add Firebase auth later
    set({ isLoading: false });
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Mock login for now
      const mockUser: User = {
        id: '1',
        email,
        displayName: email.split('@')[0],
        role: 'guest',
        createdAt: new Date(),
      };
      set({ user: mockUser, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true, error: null });
    try {
      // Mock signup for now
      const newUser: User = {
        id: Date.now().toString(),
        email,
        displayName,
        role: 'guest',
        createdAt: new Date(),
      };
      set({ user: newUser, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ user: null, firebaseUser: null });
  },

  clearError: () => set({ error: null }),
}));
