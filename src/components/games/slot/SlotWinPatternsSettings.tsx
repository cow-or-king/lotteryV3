/**
 * Slot Win Patterns Settings Component
 * Configuration des patterns de gains de la machine à sous
 * IMPORTANT: ZERO any types
 */

'use client';

import { SlotMachineDesignConfig, SlotWinPattern } from '@/lib/types/game-design.types';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

interface SlotWinPatternsSettingsProps {
  design: SlotMachineDesignConfig;
  onAddPattern: (pattern: Omit<SlotWinPattern, 'id'>) => void;
  onUpdatePattern: (id: string, updates: Partial<SlotWinPattern>) => void;
  onDeletePattern: (id: string) => void;
}

export function SlotWinPatternsSettings({
  design,
  onAddPattern,
  onUpdatePattern,
  onDeletePattern,
}: SlotWinPatternsSettingsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPattern, setNewPattern] = useState<Omit<SlotWinPattern, 'id'>>({
    matchCount: 2,
    symbol: design.symbols[0]?.icon || '🍒',
    multiplier: 2,
    probability: 10,
    label: 'Petit gain',
  });

  const handleAddPattern = () => {
    onAddPattern(newPattern);
    setNewPattern({
      matchCount: 2,
      symbol: design.symbols[0]?.icon || '🍒',
      multiplier: 2,
      probability: 10,
      label: 'Petit gain',
    });
    setShowAddForm(false);
  };

  // Calculate total probability
  const totalProbability = design.winPatterns.reduce(
    (sum, pattern) => sum + pattern.probability,
    0,
  );

  // Sort patterns by probability (descending)
  const sortedPatterns = [...design.winPatterns].sort((a, b) => b.probability - a.probability);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Patterns de Gain</label>
          <p className="text-xs text-gray-500">
            Probabilité totale: {totalProbability.toFixed(1)}%{' '}
            {totalProbability > 100 && (
              <span className="text-red-600 font-semibold">⚠️ Dépasse 100%</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Add Pattern Form */}
      {showAddForm && (
        <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200 space-y-3">
          <h4 className="font-semibold text-gray-800 text-sm">Nouveau Pattern</h4>

          <div className="grid grid-cols-2 gap-3">
            {/* Symbol Selection */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Symbole</label>
              <select
                value={newPattern.symbol}
                onChange={(e) => setNewPattern({ ...newPattern, symbol: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-2xl text-center"
              >
                {design.symbols.map((symbol) => (
                  <option key={symbol.id} value={symbol.icon}>
                    {symbol.icon}
                  </option>
                ))}
              </select>
            </div>

            {/* Match Count */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Nombre de symboles</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setNewPattern({ ...newPattern, matchCount: 2 })}
                  className={`px-3 py-2 rounded font-semibold transition-all ${
                    newPattern.matchCount === 2
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  2
                </button>
                <button
                  onClick={() => setNewPattern({ ...newPattern, matchCount: 3 })}
                  className={`px-3 py-2 rounded font-semibold transition-all ${
                    newPattern.matchCount === 3
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  3
                </button>
              </div>
            </div>

            {/* Multiplier */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Multiplicateur: x{newPattern.multiplier}
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={newPattern.multiplier}
                onChange={(e) =>
                  setNewPattern({ ...newPattern, multiplier: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Probability */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Probabilité: {newPattern.probability.toFixed(1)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="50"
                step="0.1"
                value={newPattern.probability}
                onChange={(e) =>
                  setNewPattern({ ...newPattern, probability: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Label */}
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Label</label>
              <input
                type="text"
                value={newPattern.label}
                onChange={(e) => setNewPattern({ ...newPattern, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Ex: Petit gain, Jackpot..."
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddPattern}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm"
            >
              Ajouter
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Patterns List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedPatterns.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Aucun pattern configuré. Ajoutez-en un pour commencer.
          </div>
        ) : (
          sortedPatterns.map((pattern) => (
            <div
              key={pattern.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                pattern.matchCount === 3
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{pattern.symbol}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800">{pattern.label}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          pattern.matchCount === 3
                            ? 'bg-green-500 text-white'
                            : 'bg-yellow-500 text-white'
                        }`}
                      >
                        {pattern.matchCount} symboles
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                      <span className="font-semibold">x{pattern.multiplier}</span>
                      <span className="flex items-center gap-1">
                        {pattern.probability >= 10 ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-orange-600" />
                        )}
                        {pattern.probability.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDeletePattern(pattern.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Edit Controls */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Multiplicateur: x{pattern.multiplier}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={pattern.multiplier}
                    onChange={(e) =>
                      onUpdatePattern(pattern.id, { multiplier: Number(e.target.value) })
                    }
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Probabilité: {pattern.probability.toFixed(1)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={pattern.probability}
                    onChange={(e) =>
                      onUpdatePattern(pattern.id, { probability: Number(e.target.value) })
                    }
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tips */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-xs font-semibold text-blue-800 mb-1">💡 Conseils</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 2 symboles = gains fréquents, faible multiplicateur (x2-x5)</li>
          <li>• 3 symboles = gains rares, fort multiplicateur (x10-x100)</li>
          <li>• La probabilité totale devrait rester sous 100%</li>
          <li>
            • Un bon équilibre: 60-80% pour les gains à 2 symboles, 5-10% pour les gains à 3
            symboles
          </li>
        </ul>
      </div>
    </div>
  );
}
