/**
 * QRCodeStyleSelector Component
 * Selector component for QR code visual styles with glassmorphism design
 * IMPORTANT: ZERO any types, Mobile-first responsive
 */

'use client';

import { cn } from '@/lib/utils';
import { QRCodeStyle, QR_CODE_STYLE_PREVIEWS } from '@/lib/types/qr-code.types';

/**
 * Props for QRCodeStyleSelector component
 */
interface QRCodeStyleSelectorProps {
  /** Currently selected QR code style */
  value: QRCodeStyle;
  /** Callback function when style selection changes */
  onChange: (style: QRCodeStyle) => void;
}

/**
 * QR Code Style Selector Component
 * Displays all available QR code styles in a responsive grid with glassmorphism cards
 * @param props - Component props
 * @returns JSX Element
 */
export function QRCodeStyleSelector({ value, onChange }: QRCodeStyleSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">Style du QR Code</label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {QR_CODE_STYLE_PREVIEWS.map((preview) => {
          const isSelected = value === preview.style;

          return (
            <button
              key={preview.style}
              type="button"
              onClick={() => onChange(preview.style)}
              className={cn(
                'relative group',
                'flex flex-col items-center justify-center',
                'p-6 rounded-2xl',
                'border-2 backdrop-blur-xl',
                'transition-all duration-300 ease-out',
                'hover:scale-105 hover:shadow-xl',
                'focus:outline-none focus:ring-4 focus:ring-purple-500/30',
                isSelected
                  ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-500 shadow-lg scale-105'
                  : 'bg-white/40 border-white/40 hover:border-purple-300',
              )}
            >
              {/* Recommended Badge */}
              {preview.recommended && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    Recommandé
                  </div>
                </div>
              )}

              {/* Style Icon */}
              <div
                className={cn(
                  'text-5xl mb-3 transition-transform duration-300',
                  'group-hover:scale-110',
                  isSelected && 'scale-110',
                )}
              >
                {preview.icon}
              </div>

              {/* Style Label */}
              <div
                className={cn(
                  'text-base font-bold mb-1 transition-colors',
                  isSelected ? 'text-purple-900' : 'text-gray-800',
                )}
              >
                {preview.label}
              </div>

              {/* Style Description */}
              <div
                className={cn(
                  'text-xs text-center transition-colors',
                  isSelected ? 'text-purple-700' : 'text-gray-600',
                )}
              >
                {preview.description}
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute bottom-3 w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
