/**
 * Wheel Logo Settings Component
 * Configuration du logo central de la roue
 * IMPORTANT: ZERO any types
 */

'use client';

import { Image as ImageIcon } from 'lucide-react';
import type { WheelDesignConfig } from '@/lib/types/game';

interface WheelLogoSettingsProps {
  design: WheelDesignConfig;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
  onLogoSizeChange: (size: number) => void;
}

export function WheelLogoSettings({
  design,
  onLogoUpload,
  onRemoveLogo,
  onLogoSizeChange,
}: WheelLogoSettingsProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">Logo central</label>

      {!design.centerLogoUrl ? (
        <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-purple-400 transition-colors cursor-pointer block">
          <input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" />
          <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm sm:text-base text-gray-600 mb-2">Cliquez pour uploader un logo</p>
          <p className="text-xs text-gray-500">PNG, JPG, SVG - Max 2MB</p>
        </label>
      ) : (
        <div className="border-2 border-gray-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-center mb-4">
            <img
              src={design.centerLogoUrl}
              alt="Logo"
              className="max-w-full max-h-32 object-contain"
            />
          </div>
          <div className="flex gap-2">
            <label className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer text-center text-sm sm:text-base">
              <input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" />
              Changer
            </label>
            <button
              onClick={onRemoveLogo}
              className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors text-sm sm:text-base"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}

      {/* Taille du logo */}
      <div className="mt-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Taille du logo: {design.centerLogoSize}px
        </label>
        <input
          type="range"
          min="40"
          max="120"
          value={design.centerLogoSize}
          onChange={(e) => onLogoSizeChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Petit</span>
          <span>Grand</span>
        </div>
      </div>
    </div>
  );
}
