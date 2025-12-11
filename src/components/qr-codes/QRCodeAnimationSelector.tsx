/**
 * QRCodeAnimationSelector Component
 * Selector for QR code animations with glassmorphism design
 * IMPORTANT: ZERO any types
 */

'use client';

import { type QRCodeAnimation, QR_CODE_ANIMATION_PREVIEWS } from '@/lib/types/qr-code.types';
import { cn } from '@/lib/utils';

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
    <div className="space-y-2">
      {/* Title */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-800">Animation</label>{' '}
        <p className="text-xs text-gray-600"> Survole le QR code pour voir l'animation</p>
      </div>

      {/* Animation cards flex */}
      <div className="flex flex-wrap gap-2">
        {QR_CODE_ANIMATION_PREVIEWS.map((preview) => (
          <button
            key={preview.animation}
            onClick={() => onChange(preview.animation)}
            className={cn(
              'px-3 py-2 rounded-lg text-xs font-medium transition-all',
              value === preview.animation
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-gray-50',
            )}
          >
            {preview.label}
          </button>
        ))}
      </div>
    </div>
  );
}
