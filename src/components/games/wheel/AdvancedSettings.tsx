/**
 * Advanced Settings Component
 * Paramètres avancés pour la roue (sons, animations, style)
 * IMPORTANT: ZERO any types, mobile-first responsive
 */

import { WheelDesignConfig } from '@/lib/types/game-design.types';

interface AdvancedSettingsProps {
  design: WheelDesignConfig;
  onUpdate: (updates: Partial<WheelDesignConfig>) => void;
}

export function AdvancedSettings({ design, onUpdate }: AdvancedSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Son et Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vitesse d&apos;animation
          </label>
          <select
            value={design.animationSpeed}
            onChange={(e) =>
              onUpdate({
                animationSpeed: e.target.value as 'slow' | 'normal' | 'fast',
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="slow">Lente</option>
            <option value="normal">Normale</option>
            <option value="fast">Rapide</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durée rotation (ms)
          </label>
          <input
            type="number"
            value={design.spinDuration}
            onChange={(e) => onUpdate({ spinDuration: Number(e.target.value) })}
            min="2000"
            max="10000"
            step="500"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Son */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="font-medium text-gray-900">Activer le son</div>
          <div className="text-sm text-gray-500">Son lors de la rotation</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={design.enableSound}
            onChange={(e) => onUpdate({ enableSound: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {/* Style de pointeur */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Style de pointeur</label>
        <div className="grid grid-cols-3 gap-3">
          {(['arrow', 'triangle', 'circle'] as const).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => onUpdate({ pointerStyle: style })}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${
                  design.pointerStyle === style
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="text-sm font-medium capitalize">{style}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Couleurs avancées */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Couleur fond</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={design.backgroundColor}
              onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
            />
            <input
              type="text"
              value={design.backgroundColor}
              onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Couleur pointeur</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={design.pointerColor}
              onChange={(e) => onUpdate({ pointerColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
            />
            <input
              type="text"
              value={design.pointerColor}
              onChange={(e) => onUpdate({ pointerColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
            />
          </div>
        </div>
      </div>

      {/* Bordures segments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Épaisseur bordure: {design.segmentBorderWidth}px
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={design.segmentBorderWidth}
            onChange={(e) => onUpdate({ segmentBorderWidth: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Couleur bordure</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={design.segmentBorderColor}
              onChange={(e) => onUpdate({ segmentBorderColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
            />
            <input
              type="text"
              value={design.segmentBorderColor}
              onChange={(e) => onUpdate({ segmentBorderColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
            />
          </div>
        </div>
      </div>

      {/* Texte */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">Afficher le texte</div>
            <div className="text-sm text-gray-500">Texte sur les segments</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={design.showSegmentText}
              onChange={(e) => onUpdate({ showSegmentText: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {design.showSegmentText && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille texte: {design.textSize}px
              </label>
              <input
                type="range"
                min="10"
                max="32"
                value={design.textSize}
                onChange={(e) => onUpdate({ textSize: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Police</label>
              <select
                value={design.textFont}
                onChange={(e) => onUpdate({ textFont: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
