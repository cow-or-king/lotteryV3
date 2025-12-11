/**
 * QRCodeAnimationSelector Component
 * Selector for QR code animations with glassmorphism design
 * IMPORTANT: ZERO any types
 */

'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { cn } from '@/lib/utils';
import { type QRCodeAnimation, QR_CODE_ANIMATION_PREVIEWS } from '@/lib/types/qr-code.types';

/**
 * Props for QRCodeAnimationSelector component
 */
interface QRCodeAnimationSelectorProps {
  /** Currently selected animation */
  value: QRCodeAnimation | null;
  /** Callback when animation selection changes */
  onChange: (animation: QRCodeAnimation | null) => void;
}

/**
 * Component for selecting QR code animations
 * Displays all available animations in a responsive grid with previews
 */
export function QRCodeAnimationSelector({ value, onChange }: QRCodeAnimationSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Preview hint */}
      <p className="text-sm text-gray-600 text-center">Hover over QR code to see animation</p>

      {/* Animation grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {QR_CODE_ANIMATION_PREVIEWS.map((preview) => {
          const isSelected = value === preview.animation;

          return (
            <GlassCard
              key={preview.animation}
              variant="light"
              blur="xl"
              className={cn(
                'cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl',
                'flex flex-col gap-3 p-6',
                isSelected && 'ring-2 ring-purple-500 ring-offset-2 shadow-purple-500/50',
              )}
              onClick={() => onChange(preview.animation)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(preview.animation);
                }
              }}
              aria-pressed={isSelected}
              aria-label={`Select ${preview.label} animation`}
            >
              {/* Header with label and badge */}
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={cn(
                    'font-semibold text-base',
                    isSelected ? 'text-purple-700' : 'text-gray-800',
                  )}
                >
                  {preview.label}
                </h3>
                {preview.badge && (
                  <GlassBadge variant="info" size="sm">
                    {preview.badge}
                  </GlassBadge>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">{preview.description}</p>

              {/* Selected indicator */}
              {isSelected && (
                <div className="mt-auto pt-2 border-t border-purple-200/50">
                  <span className="text-xs font-medium text-purple-600">✓ Sélectionné</span>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
