/**
 * Color Mode Selector Component
 * Sélecteur de mode de couleur (bi-color / multi-color)
 * IMPORTANT: ZERO any types, mobile-first responsive
 */

import { ColorMode, ColorModeEnum } from '@/lib/types/game';

interface ColorModeSelectorProps {
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
}

export function ColorModeSelector({ colorMode, onColorModeChange }: ColorModeSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-3">Mode de couleur</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onColorModeChange(ColorModeEnum.BI_COLOR)}
          className={`
            p-4 rounded-xl border-2 transition-all
            ${
              colorMode === ColorModeEnum.BI_COLOR
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded bg-purple-500" />
              <div className="w-6 h-6 rounded bg-pink-500" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Bi-color</div>
              <div className="text-xs text-gray-500">2 couleurs alternées</div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onColorModeChange(ColorModeEnum.MULTI_COLOR)}
          className={`
            p-4 rounded-xl border-2 transition-all
            ${
              colorMode === ColorModeEnum.MULTI_COLOR
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-4 h-6 rounded bg-red-500" />
              <div className="w-4 h-6 rounded bg-yellow-500" />
              <div className="w-4 h-6 rounded bg-green-500" />
              <div className="w-4 h-6 rounded bg-blue-500" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Multicolor</div>
              <div className="text-xs text-gray-500">Couleur par segment</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
