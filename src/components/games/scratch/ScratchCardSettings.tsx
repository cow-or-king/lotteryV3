/**
 * Scratch Card Settings Component
 * Configuration des paramètres de la carte à gratter
 * IMPORTANT: ZERO any types
 */

'use client';

import {
  ScratchDesignConfig,
  ScratchWinPattern,
  ScratchAnimation,
} from '@/lib/types/game-design.types';

interface ScratchCardSettingsProps {
  design: ScratchDesignConfig;
  onBackgroundColorChange: (color: string) => void;
  onForegroundColorChange: (color: string) => void;
  onWinPatternChange: (pattern: ScratchWinPattern) => void;
  onAnimationChange: (animation: ScratchAnimation) => void;
  onRevealDurationChange: (duration: number) => void;
  onZoneCountChange: (count: number) => void;
}

export function ScratchCardSettings({
  design,
  onBackgroundColorChange,
  onForegroundColorChange,
  onWinPatternChange,
  onAnimationChange,
  onRevealDurationChange,
  onZoneCountChange,
}: ScratchCardSettingsProps) {
  return (
    <>
      {/* Colors */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Couleurs</label>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur de fond</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={design.backgroundColor}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
              />
              <span className="text-sm text-gray-700 font-mono">{design.backgroundColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur de grattage</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={design.foregroundColor}
                onChange={(e) => onForegroundColorChange(e.target.value)}
                className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
              />
              <span className="text-sm text-gray-700 font-mono">{design.foregroundColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Number of zones */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Nombre de zones</label>
        <div className="grid grid-cols-3 gap-2">
          {[3, 6, 8, 9].map((count) => (
            <button
              key={count}
              onClick={() => onZoneCountChange(count)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                design.zones.length === count
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Win Pattern */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Motif gagnant</label>
        <div className="space-y-2">
          <button
            onClick={() => onWinPatternChange('THREE_IN_ROW')}
            className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
              design.winPattern === 'THREE_IN_ROW'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="font-semibold">3 symboles identiques</div>
            <div className="text-xs opacity-80">Tous les symboles doivent être identiques</div>
          </button>
          <button
            onClick={() => onWinPatternChange('ALL_MATCH')}
            className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
              design.winPattern === 'ALL_MATCH'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="font-semibold">Toutes les zones gagnantes</div>
            <div className="text-xs opacity-80">Toutes les zones marquées gagnantes</div>
          </button>
          <button
            onClick={() => onWinPatternChange('ANY_THREE')}
            className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
              design.winPattern === 'ANY_THREE'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="font-semibold">3 zones gagnantes</div>
            <div className="text-xs opacity-80">Au moins 3 zones marquées gagnantes</div>
          </button>
        </div>
      </div>

      {/* Animation */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Animation de révélation
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['FADE', 'PARTICLE', 'SHINE'] as ScratchAnimation[]).map((anim) => (
            <button
              key={anim}
              onClick={() => onAnimationChange(anim)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                design.scratchAnimation === anim
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {anim === 'FADE' ? 'Fondu' : anim === 'PARTICLE' ? 'Particules' : 'Brillance'}
            </button>
          ))}
        </div>
      </div>

      {/* Reveal Duration */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Durée de révélation: {design.revealDuration}ms
        </label>
        <input
          type="range"
          min="500"
          max="3000"
          step="100"
          value={design.revealDuration}
          onChange={(e) => onRevealDurationChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Rapide</span>
          <span>Lent</span>
        </div>
      </div>
    </>
  );
}
