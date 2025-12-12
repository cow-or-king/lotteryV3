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

export const useToast = () => {
  const { toasts, addToast, removeToast } = useToastStore();

  const toast = (params: {
    title: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
  }) => {
    addToast({
      title: params.title,
      description: params.description,
      variant: params.variant || 'default',
      duration: params.duration,
    });
  };

  // Helper methods for common toast variants
  const toastWithHelpers = Object.assign(toast, {
    success: (title: string, description?: string) => {
      addToast({
        title,
        description,
        variant: 'success',
      });
    },
    error: (title: string, description?: string) => {
      addToast({
        title,
        description,
        variant: 'error',
      });
    },
    warning: (title: string, description?: string) => {
      addToast({
        title,
        description,
        variant: 'warning',
      });
    },
    info: (title: string, description?: string) => {
      addToast({
        title,
        description,
        variant: 'default',
      });
    },
  });

  return {
    toasts,
    toast: toastWithHelpers,
    removeToast,
  };
};
