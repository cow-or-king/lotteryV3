'use client';

import { DEFAULT_FOREGROUND_COLOR, DEFAULT_BACKGROUND_COLOR } from '@/lib/types/qr-code.types';

/**
 * Props for QRCodeColorPicker component
 */
interface QRCodeColorPickerProps {
  foregroundColor: string;
  backgroundColor: string;
  onForegroundChange: (color: string) => void;
  onBackgroundChange: (color: string) => void;
}

/**
 * QRCodeColorPicker Component
 *
 * Color picker for QR code foreground and background colors with glassmorphism design.
 * Features:
 * - HTML5 color input with preview
 * - Hex value text input
 * - Reset to default button
 * - Color preview circles
 *
 * @param props - Component props
 * @returns QR code color picker component
 */
export function QRCodeColorPicker({
  foregroundColor,
  backgroundColor,
  onForegroundChange,
  onBackgroundChange,
}: QRCodeColorPickerProps) {
  /**
   * Handles hex input change and validates the color format
   *
   * @param value - Hex color value
   * @param onChange - Callback to update color
   */
  const handleHexChange = (value: string, onChange: (color: string) => void) => {
    const hex = value.startsWith('#') ? value : `#${value}`;

    // Validate hex color format
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      onChange(hex);
    }
  };

  return (
    <div className="space-y-6">
      {/* Foreground Color */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            QR Code Color
          </label>
          <button
            type="button"
            onClick={() => onForegroundChange(DEFAULT_FOREGROUND_COLOR)}
            className="text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Reset foreground color to default"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Color Preview */}
          <div
            className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-sm"
            style={{ backgroundColor: foregroundColor }}
            aria-label="Foreground color preview"
          />

          {/* Color Input */}
          <div className="flex-1">
            <input
              type="color"
              value={foregroundColor}
              onChange={(e) => onForegroundChange(e.target.value)}
              className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
              aria-label="Pick foreground color"
            />
          </div>

          {/* Hex Input */}
          <div className="flex-1">
            <input
              type="text"
              value={foregroundColor}
              onChange={(e) => handleHexChange(e.target.value, onForegroundChange)}
              className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="#000000"
              maxLength={7}
              aria-label="Foreground color hex value"
            />
          </div>
        </div>
      </div>

      {/* Background Color */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Background</label>
          <button
            type="button"
            onClick={() => onBackgroundChange(DEFAULT_BACKGROUND_COLOR)}
            className="text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Reset background color to default"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Color Preview */}
          <div
            className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-sm"
            style={{ backgroundColor: backgroundColor }}
            aria-label="Background color preview"
          />

          {/* Color Input */}
          <div className="flex-1">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundChange(e.target.value)}
              className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
              aria-label="Pick background color"
            />
          </div>

          {/* Hex Input */}
          <div className="flex-1">
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => handleHexChange(e.target.value, onBackgroundChange)}
              className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="#FFFFFF"
              maxLength={7}
              aria-label="Background color hex value"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
