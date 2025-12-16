/**
 * Slot Reels Settings Component
 * Configuration des rouleaux de la machine à sous
 * IMPORTANT: ZERO any types
 */

'use client';

import { SlotMachineDesignConfig, SlotSpinEasing, SlotSymbol } from '@/lib/types/game';

interface SlotReelsSettingsProps {
  design: SlotMachineDesignConfig;
  onReelsCountChange: (count: 3 | 4 | 5) => void;
  onBackgroundColorChange: (color: string) => void;
  onReelBorderColorChange: (color: string) => void;
  onSpinDurationChange: (duration: number) => void;
  onSpinEasingChange: (easing: SlotSpinEasing) => void;
  onReelDelayChange: (delay: number) => void;
  onSymbolChange: (index: number, updates: Partial<SlotSymbol>) => void;
}

export function SlotReelsSettings({
  design,
  onReelsCountChange,
  onBackgroundColorChange,
  onReelBorderColorChange,
  onSpinDurationChange,
  onSpinEasingChange,
  onReelDelayChange,
  onSymbolChange,
}: SlotReelsSettingsProps) {
  return (
    <>
      {/* Number of reels */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Nombre de rouleaux</label>
        <div className="grid grid-cols-3 gap-2">
          {([3, 4, 5] as const).map((count) => (
            <button
              key={count}
              onClick={() => onReelsCountChange(count)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                design.reelsCount === count
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Couleurs</label>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Fond</label>
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
            <label className="block text-xs text-gray-600 mb-1">Bordure des rouleaux</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={design.reelBorderColor}
                onChange={(e) => onReelBorderColorChange(e.target.value)}
                className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
              />
              <span className="text-sm text-gray-700 font-mono">{design.reelBorderColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spin Duration */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Durée de rotation: {design.spinDuration}ms
        </label>
        <input
          type="range"
          min="1000"
          max="6000"
          step="100"
          value={design.spinDuration}
          onChange={(e) => onSpinDurationChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Rapide</span>
          <span>Lent</span>
        </div>
      </div>

      {/* Spin Easing */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Type d&apos;animation
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['LINEAR', 'EASE_OUT', 'BOUNCE'] as SlotSpinEasing[]).map((easing) => (
            <button
              key={easing}
              onClick={() => onSpinEasingChange(easing)}
              className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                design.spinEasing === easing
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {easing === 'LINEAR' ? 'Linéaire' : easing === 'EASE_OUT' ? 'Ralenti' : 'Rebond'}
            </button>
          ))}
        </div>
      </div>

      {/* Reel Delay */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Délai entre rouleaux: {design.reelDelay}ms
        </label>
        <input
          type="range"
          min="0"
          max="500"
          step="50"
          value={design.reelDelay}
          onChange={(e) => onReelDelayChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Simultané</span>
          <span>Séquentiel</span>
        </div>
      </div>

      {/* Symbols */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Symboles</label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {design.symbols.map((symbol, index) => (
            <div
              key={symbol.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="text-3xl">{symbol.icon}</div>
              <div className="flex-1">
                <input
                  type="text"
                  value={symbol.icon}
                  onChange={(e) => onSymbolChange(index, { icon: e.target.value })}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Emoji"
                  maxLength={2}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={symbol.color}
                  onChange={(e) => onSymbolChange(index, { color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                />
                <input
                  type="number"
                  value={symbol.value}
                  onChange={(e) => onSymbolChange(index, { value: Number(e.target.value) })}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Pts"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
