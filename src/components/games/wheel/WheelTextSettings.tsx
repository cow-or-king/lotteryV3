/**
 * Wheel Text Settings Component
 * Configuration du texte sur les segments de la roue
 * IMPORTANT: ZERO any types
 */

'use client';

import type { WheelDesignConfig } from '@/lib/types/game-design.types';

interface WheelTextSettingsProps {
  design: WheelDesignConfig;
  onShowTextChange: (show: boolean) => void;
  onTextSizeChange: (size: number) => void;
  onTextRotationChange: (rotation: number) => void;
}

export function WheelTextSettings({
  design,
  onShowTextChange,
  onTextSizeChange,
  onTextRotationChange,
}: WheelTextSettingsProps) {
  return (
    <>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="font-medium text-gray-900">Afficher le texte</div>
          <div className="text-sm text-gray-500">Texte sur les segments</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={design.showSegmentText}
            onChange={(e) => onShowTextChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {design.showSegmentText && (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Taille du texte: {design.textSize}px
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={design.textSize}
              onChange={(e) => onTextSizeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Inclinaison: {design.textRotation}°
            </label>
            <input
              type="range"
              min="0"
              max="90"
              value={design.textRotation}
              onChange={(e) => onTextRotationChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Horizontal</span>
              <span>Vertical</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
