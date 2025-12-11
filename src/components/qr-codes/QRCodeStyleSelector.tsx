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
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-800">Style</label>

      <div className="flex flex-wrap gap-2">
        {QR_CODE_STYLE_PREVIEWS.map((preview) => {
          const isSelected = value === preview.style;

          return (
            <button
              key={preview.style}
              type="button"
              onClick={() => onChange(preview.style)}
              className={cn(
                'relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                isSelected
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-gray-50',
              )}
            >
              <span className="text-base">{preview.icon}</span>
              <span className="truncate">{preview.label}</span>
              {preview.recommended && (
                <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full">
                  ★
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
