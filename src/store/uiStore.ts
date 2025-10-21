// src/store/uiStore.ts
import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: any;
}

interface UIState {
  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Modal management
  modals: Modal[];
  openModal: (modal: Omit<Modal, 'id'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Loading states
  loading: { [key: string]: boolean };
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;

  // Bottom sheet
  bottomSheet: {
    isOpen: boolean;
    content: React.ReactNode | null;
  };
  openBottomSheet: (content: React.ReactNode) => void;
  closeBottomSheet: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto-remove after duration
    const duration = toast.duration || 3000;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  // Modals
  modals: [],
  openModal: (modal) => {
    const id = `modal-${Date.now()}-${Math.random()}`;
    set((state) => ({ modals: [...state.modals, { ...modal, id }] }));
  },
  closeModal: (id) => {
    set((state) => ({ modals: state.modals.filter((m) => m.id !== id) }));
  },
  closeAllModals: () => {
    set({ modals: [] });
  },

  // Loading
  loading: {},
  setLoading: (key, isLoading) => {
    set((state) => ({
      loading: { ...state.loading, [key]: isLoading },
    }));
  },
  isLoading: (key) => {
    return get().loading[key] || false;
  },

  // Bottom sheet
  bottomSheet: {
    isOpen: false,
    content: null,
  },
  openBottomSheet: (content) => {
    set({ bottomSheet: { isOpen: true, content } });
  },
  closeBottomSheet: () => {
    set({ bottomSheet: { isOpen: false, content: null } });
  },
}));