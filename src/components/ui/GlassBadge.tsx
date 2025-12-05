/**
 * GlassBadge Component - Glassmorphism Style
 * Badge avec effet verre pour labels et indicateurs
 * IMPORTANT: ZERO any types
 */

'use client';

import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassBadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge avec effet glassmorphism
 */
export const GlassBadge = forwardRef<HTMLDivElement, GlassBadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-white/30 text-gray-700',
      success: 'bg-green-500/20 text-green-800 border-green-300/30',
      warning: 'bg-yellow-500/20 text-yellow-800 border-yellow-300/30',
      danger: 'bg-red-500/20 text-red-800 border-red-300/30',
      info: 'bg-blue-500/20 text-blue-800 border-blue-300/30',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1.5 text-xs',
      lg: 'px-4 py-2 text-sm',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'backdrop-blur-xl rounded-full font-medium border border-white/20',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

GlassBadge.displayName = 'GlassBadge';
