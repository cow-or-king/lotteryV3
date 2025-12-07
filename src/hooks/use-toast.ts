/**
 * useToast Hook
 * Hook pour gérer les notifications toast
 * IMPORTANT: ZERO any types
 */

'use client';

import { create } from 'zustand';
import type { ToastVariant } from '@/components/ui/toast';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      id,
      ...toast,
      duration: toast.duration ?? 5000,
    };
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, newToast.duration);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  removeAllToasts: () => set({ toasts: [] }),
}));

export const useToast = (): {
  toasts: ToastMessage[];
  toast: {
    success: (title: string, description?: string, duration?: number) => void;
    error: (title: string, description?: string, duration?: number) => void;
    warning: (title: string, description?: string, duration?: number) => void;
    info: (title: string, description?: string, duration?: number) => void;
    default: (title: string, description?: string, duration?: number) => void;
  };
  removeToast: (id: string) => void;
} => {
  const { toasts, addToast, removeToast } = useToastStore();

  return {
    toasts,
    toast: {
      success: (title: string, description?: string, duration?: number) =>
        addToast({ title, description, variant: 'success', duration }),
      error: (title: string, description?: string, duration?: number) =>
        addToast({ title, description, variant: 'error', duration }),
      warning: (title: string, description?: string, duration?: number) =>
        addToast({ title, description, variant: 'warning', duration }),
      info: (title: string, description?: string, duration?: number) =>
        addToast({ title, description, variant: 'info', duration }),
      default: (title: string, description?: string, duration?: number) =>
        addToast({ title, description, variant: 'default', duration }),
    },
    removeToast,
  };
};
