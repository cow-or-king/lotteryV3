/**
 * GlassInput Component - Glassmorphism Style
 * Input avec effet verre et transparence
 * IMPORTANT: ZERO any types
 */

'use client';

import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | undefined;
  error?: string | undefined;
  helperText?: string | undefined;
  icon?: string | React.ReactNode | undefined;
  fullWidth?: boolean | undefined;
}

/**
 * Input avec effet glassmorphism
 */
export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, helperText, icon, fullWidth = false, ...props }, ref) => {
    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && <label className="block text-sm font-semibold text-gray-700">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              {typeof icon === 'string' ? (
                <span
                  className="text-2xl opacity-100"
                  style={{ filter: 'contrast(1.2) brightness(1.1)' }}
                >
                  {icon}
                </span>
              ) : (
                icon
              )}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full py-3 bg-white/70 backdrop-blur border border-white/60 rounded-2xl',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
              'text-gray-900 font-medium placeholder:text-gray-600 transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              icon ? 'pl-10 pr-3' : 'px-4',
              error && 'border-red-400/50 focus:ring-red-400',
              fullWidth && 'w-full',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-600 ml-1">{error}</p>}
        {helperText && !error && <p className="text-sm text-gray-500 ml-1">{helperText}</p>}
      </div>
    );
  },
);

GlassInput.displayName = 'GlassInput';
