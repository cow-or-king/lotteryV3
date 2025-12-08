/**
 * GlassButton Component - Glassmorphism Style
 * Bouton avec effet verre et gradient
 * IMPORTANT: ZERO any types
 */

'use client';

import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

/**
 * Button avec effet glassmorphism
 */
export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'font-semibold rounded-2xl transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent';

    const variants = {
      primary:
        'bg-linear-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-xl focus:ring-purple-400',
      secondary:
        'bg-white/50 backdrop-blur text-gray-800 hover:bg-white/70 border border-white/50 focus:ring-white',
      ghost: 'bg-transparent text-gray-700 hover:bg-white/20 backdrop-blur focus:ring-gray-400',
      danger:
        'bg-linear-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-xl focus:ring-red-400',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const hoverEffect = !disabled && !loading ? 'hover:-translate-y-0.5' : '';

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          hoverEffect,
          fullWidth && 'w-full',
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Chargement...
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

GlassButton.displayName = 'GlassButton';
