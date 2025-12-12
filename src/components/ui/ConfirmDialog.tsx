/**
 * ConfirmDialog Component - Glassmorphism Style
 * Modal de confirmation réutilisable avec effet verre
 * IMPORTANT: ZERO any types
 */

'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

export interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const variantConfig = {
  danger: {
    icon: AlertCircle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100',
    buttonColor: 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 focus:ring-red-400',
    borderColor: 'border-red-200',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100',
    buttonColor:
      'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 focus:ring-orange-400',
    borderColor: 'border-orange-200',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    buttonColor:
      'from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:ring-blue-400',
    borderColor: 'border-blue-200',
  },
};

/**
 * Modal de confirmation avec design glassmorphism
 */
export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'warning',
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  // ESC pour fermer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onCancel();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onCancel]);

  // Focus trap simple
  useEffect(() => {
    if (open) {
      const dialog = document.getElementById('confirm-dialog');
      const focusableElements = dialog?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      firstElement?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      {/* Backdrop glassmorphism */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-md"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        id="confirm-dialog"
        className={cn(
          'relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border',
          'max-w-md w-full p-6 sm:p-8',
          'animate-in zoom-in-95 duration-300',
          config.borderColor,
        )}
      >
        {/* Bouton fermer */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className={cn('flex items-center justify-center w-12 h-12 rounded-2xl', config.iconBg)}
          >
            <Icon className={cn('w-6 h-6', config.iconColor)} />
          </div>
          <h2 id="dialog-title" className="text-2xl font-bold text-gray-900">
            {title}
          </h2>
        </div>

        {/* Message */}
        <p id="dialog-description" className="text-gray-700 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={onCancel}
            className={cn(
              'flex-1 px-4 py-3 rounded-xl font-semibold transition-all',
              'bg-white/70 hover:bg-white border border-gray-300',
              'text-gray-700 hover:text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
            )}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300',
              'bg-linear-to-r text-white shadow-lg',
              'hover:scale-105 transform',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              config.buttonColor,
            )}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
