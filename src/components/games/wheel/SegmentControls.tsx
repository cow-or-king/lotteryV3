/**
 * Segment Controls Component
 * Contrôles pour le nombre de segments et couleurs
 * IMPORTANT: ZERO any types, mobile-first responsive
 */

import { ColorMode, ColorModeEnum } from '@/lib/types/game-design.types';

interface SegmentControlsProps {
  numberOfSegments: number;
  colorMode: ColorMode;
  primaryColor: string | null | undefined;
  secondaryColor: string | null | undefined;
  onNumberOfSegmentsChange: (count: number) => void;
  onPrimaryColorChange: (color: string) => void;
  onSecondaryColorChange: (color: string) => void;
}

export function SegmentControls({
  numberOfSegments,
  colorMode,
  primaryColor,
  secondaryColor,
  onNumberOfSegmentsChange,
  onPrimaryColorChange,
  onSecondaryColorChange,
}: SegmentControlsProps) {
  return (
    <div className="space-y-6">
      {/* Nombre de segments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Nombre de segments: {numberOfSegments}
        </label>
        <input
          type="range"
          min="4"
          max="12"
          value={numberOfSegments}
          onChange={(e) => onNumberOfSegmentsChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>4</span>
          <span>12</span>
        </div>
      </div>

      {/* Couleurs (si bi-color) */}
      {colorMode === ColorModeEnum.BI_COLOR && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur primaire</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={primaryColor || '#8B5CF6'}
                onChange={(e) => onPrimaryColorChange(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
              />
              <input
                type="text"
                value={primaryColor || '#8B5CF6'}
                onChange={(e) => onPrimaryColorChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                placeholder="#8B5CF6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur secondaire
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={secondaryColor || '#EC4899'}
                onChange={(e) => onSecondaryColorChange(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
              />
              <input
                type="text"
                value={secondaryColor || '#EC4899'}
                onChange={(e) => onSecondaryColorChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                placeholder="#EC4899"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
