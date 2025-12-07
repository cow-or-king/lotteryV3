/**
 * StatCard Component - Glassmorphism Style
 * Carte de statistique pour le dashboard
 * IMPORTANT: ZERO any types
 */

'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  isLoading?: boolean;
  className?: string;
}

/**
 * Carte de statistique avec effet glassmorphism
 */
export function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  isLoading = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl',
        'p-6 transition-all duration-300',
        'hover:bg-white/60 hover:border-purple-600/30 hover:shadow-lg',
        'hover:scale-[1.02]',
        className,
      )}
    >
      {/* Icon background gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
          <div className="text-purple-400">{icon}</div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>

        {/* Value */}
        {isLoading ? (
          <div className="h-10 w-32 bg-purple-100/30 rounded-xl animate-pulse"></div>
        ) : (
          <div className="flex items-baseline gap-3 mb-2">
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {trend && (
              <span
                className={cn(
                  'text-sm font-semibold',
                  trend.isPositive ? 'text-green-400' : 'text-red-400',
                )}
              >
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </div>
  );
}
