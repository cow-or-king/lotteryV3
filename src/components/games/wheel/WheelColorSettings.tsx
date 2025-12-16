/**
 * Wheel Color Settings Component
 * Configuration des couleurs pour la roue
 * IMPORTANT: ZERO any types
 */

'use client';

import { ColorModeSelector } from '@/components/games/wheel/ColorModeSelector';
import { SegmentControls } from '@/components/games/wheel/SegmentControls';
import { type WheelDesignConfig, type ColorMode } from '@/lib/types/game';

interface WheelColorSettingsProps {
  design: WheelDesignConfig;
  onNumberOfSegmentsChange: (count: number) => void;
  onColorModeChange: (mode: ColorMode) => void;
  onPrimaryColorChange: (color: string) => void;
  onSecondaryColorChange: (color: string) => void;
  onSegmentColorChange: (index: number, color: string) => void;
}

export function WheelColorSettings({
  design,
  onNumberOfSegmentsChange,
  onColorModeChange,
  onPrimaryColorChange,
  onSecondaryColorChange,
  onSegmentColorChange,
}: WheelColorSettingsProps) {
  return (
    <>
      {/* Nombre de segments */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Nombre de segments</label>
        <div className="grid grid-cols-5 gap-2">
          {[4, 6, 8, 10, 12].map((count) => (
            <button
              key={count}
              onClick={() => onNumberOfSegmentsChange(count)}
              className={`px-2 sm:px-4 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                design.numberOfSegments === count
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Mode couleur */}
      <ColorModeSelector colorMode={design.colorMode} onColorModeChange={onColorModeChange} />

      {/* Contrôles de couleur */}
      <SegmentControls
        numberOfSegments={design.numberOfSegments}
        colorMode={design.colorMode}
        primaryColor={design.primaryColor}
        secondaryColor={design.secondaryColor}
        onNumberOfSegmentsChange={onNumberOfSegmentsChange}
        onPrimaryColorChange={onPrimaryColorChange}
        onSecondaryColorChange={onSecondaryColorChange}
      />

      {/* Multi-color segments */}
      {design.colorMode === 'MULTI_COLOR' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Couleurs des segments
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {design.segments.map((segment: { id: string; color: string }, index: number) => (
              <div key={segment.id} className="text-center">
                <input
                  type="color"
                  value={segment.color}
                  onChange={(e) => onSegmentColorChange(index, e.target.value)}
                  className="w-full h-10 sm:h-12 rounded-lg cursor-pointer mb-1"
                />
                <div className="text-xs text-gray-600">S{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
