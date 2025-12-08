/**
 * GlassCard Component - Glassmorphism Style
 * Effet verre dépoli avec transparence et blur
 * IMPORTANT: ZERO any types
 */

'use client';

import { cn } from '@/lib/utils';
import { type HTMLAttributes, forwardRef } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark' | 'colored';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  noPadding?: boolean;
}

/**
 * Card avec effet glassmorphism
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'light', blur = 'xl', noPadding = false, ...props }, ref) => {
    const variants = {
      light: 'bg-white/40 border-white/20',
      dark: 'bg-black/40 border-black/20',
      colored: 'bg-linear-to-br from-purple-500/20 to-pink-500/20 border-purple-300/20',
    };

    const blurs = {
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
      xl: 'backdrop-blur-xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-3xl shadow-2xl border',
          blurs[blur],
          variants[variant],
          !noPadding && 'p-8',
          className,
        )}
        {...props}
      />
    );
  },
);

GlassCard.displayName = 'GlassCard';
