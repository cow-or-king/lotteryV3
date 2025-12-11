'use client';

/**
 * Props for QRCodeColorPicker component
 */
interface QRCodeColorPickerProps {
  foregroundColor: string;
  backgroundColor: string;
  animationColor: string;
  onForegroundChange: (color: string) => void;
  onBackgroundChange: (color: string) => void;
  onAnimationColorChange: (color: string) => void;
}

/**
 * QRCodeColorPicker Component - Compact version
 */
export function QRCodeColorPicker({
  foregroundColor,
  backgroundColor,
  animationColor,
  onForegroundChange,
  onBackgroundChange,
  onAnimationColorChange,
}: QRCodeColorPickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-800">Couleurs</label>

      <div className="grid grid-cols-3 gap-3">
        {/* Foreground Color */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">QR Code</label>
          <input
            type="color"
            value={foregroundColor}
            onChange={(e) => onForegroundChange(e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer border border-gray-300"
          />
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Fond</label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundChange(e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer border border-gray-300"
          />
        </div>

        {/* Animation Color */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Animation</label>
          <input
            type="color"
            value={animationColor}
            onChange={(e) => onAnimationColorChange(e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer border border-gray-300"
          />
        </div>
      </div>
    </div>
  );
}
