/**
 * Game Configuration Form
 * Formulaire de configuration pour créer/éditer un jeu
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { GameType, WheelGameConfig, WheelSegment } from '@/lib/types/game.types';
import { WheelEngine } from '@/lib/game-engines/wheel-engine';

interface GameConfigFormProps {
  initialValues?: {
    name: string;
    type: GameType;
    config: WheelGameConfig;
    primaryColor: string;
    secondaryColor: string;
    vibrationEnabled: boolean;
  };
  onSubmit: (values: {
    name: string;
    type: GameType;
    config: Record<string, unknown>;
    primaryColor: string;
    secondaryColor: string;
    vibrationEnabled: boolean;
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

// Helper functions extracted outside component
function calculateTotalProbability(segments: WheelSegment[]): number {
  return segments.reduce((sum, seg) => sum + seg.probability, 0);
}

function isProbabilityValid(totalProbability: number): boolean {
  return Math.abs(totalProbability - 100) < 0.01;
}

function getSegmentValueLabel(prizeType: string): string {
  return prizeType === 'DISCOUNT' ? 'Pourcentage' : 'Valeur';
}

function getSegmentValuePlaceholder(prizeType: string): string {
  return prizeType === 'DISCOUNT' ? '10' : 'Café offert';
}

function isPrizeValueDisabled(prizeType: string): boolean {
  return prizeType === 'NOTHING';
}

function canRemoveSegment(segmentsLength: number): boolean {
  return segmentsLength > 2;
}

function getProbabilityStatusClass(isValid: boolean): string {
  return isValid ? 'text-green-600' : 'text-red-600';
}

function getProbabilityStatusMessage(total: number, isValid: boolean): string {
  return `Total des probabilités: ${total.toFixed(1)}%${isValid ? ' ✓' : ' (doit être 100%)'}`;
}

function generateRandomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function createNewSegment(): WheelSegment {
  return {
    id: `segment-${Date.now()}`,
    label: 'Nouveau segment',
    color: generateRandomColor(),
    probability: 0,
    prize: { type: 'NOTHING', value: '' },
  };
}

export default function GameConfigForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: GameConfigFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [gameType] = useState<GameType>(initialValues?.type || 'WHEEL');
  const [primaryColor, setPrimaryColor] = useState(initialValues?.primaryColor || '#5B21B6');
  const [secondaryColor, setSecondaryColor] = useState(initialValues?.secondaryColor || '#EC4899');
  const [vibrationEnabled, setVibrationEnabled] = useState(initialValues?.vibrationEnabled ?? true);
  const [segments, setSegments] = useState<WheelSegment[]>(() => {
    const defaultConfig = WheelEngine.createDefaultConfig();
    return initialValues?.config.segments || defaultConfig.segments || [];
  });

  // Pre-compute boolean flags
  const totalProbability = calculateTotalProbability(segments);
  const isValid = isProbabilityValid(totalProbability);
  const canAddRemoveSegments = canRemoveSegment(segments.length);
  const probabilityStatusClass = getProbabilityStatusClass(isValid);
  const probabilityStatusMessage = getProbabilityStatusMessage(totalProbability, isValid);
  const showCancelButton = Boolean(onCancel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error('La somme des probabilités doit égaler 100%');
      return;
    }

    const config: Partial<WheelGameConfig> = {
      segments,
    };

    onSubmit({
      name,
      type: gameType,
      config: config as Record<string, unknown>,
      primaryColor,
      secondaryColor,
      vibrationEnabled,
    });
  };

  const updateSegment = (index: number, updates: Partial<WheelSegment>) => {
    const newSegments = [...segments];
    const existingSegment = newSegments[index];
    if (existingSegment) {
      newSegments[index] = { ...existingSegment, ...updates };
      setSegments(newSegments);
    }
  };

  const addSegment = () => {
    setSegments([...segments, createNewSegment()]);
  };

  const removeSegment = (index: number) => {
    if (!canAddRemoveSegments) {
      toast.warning('Un jeu doit avoir au moins 2 segments');
      return;
    }
    setSegments(segments.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informations générales */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Informations générales</h2>
        <div className="space-y-6">
          {/* Nom du jeu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du jeu *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Roue de la chance"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-gray-900 placeholder:text-gray-500"
            />
          </div>

          {/* Type de jeu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type de jeu</label>
            <div className="px-4 py-3 rounded-xl bg-gray-100 text-gray-600">
              🎡 Roue de la fortune
            </div>
          </div>
        </div>
      </div>

      {/* Apparence */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Apparence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Couleur primaire */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Couleur primaire
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-12 w-20 rounded-xl cursor-pointer border-2 border-gray-200"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none font-mono text-gray-900"
              />
            </div>
          </div>

          {/* Couleur secondaire */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Couleur secondaire
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-12 w-20 rounded-xl cursor-pointer border-2 border-gray-200"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none font-mono text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Vibration */}
        <div className="mt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={vibrationEnabled}
              onChange={(e) => setVibrationEnabled(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm font-semibold text-gray-700">
              Activer les vibrations (haptic feedback)
            </span>
          </label>
          <p className="text-sm text-gray-500 mt-2 ml-8">
            Les utilisateurs ressentiront des vibrations synchronisées avec le jeu
          </p>
        </div>
      </div>

      {/* Configuration des segments */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Segments de la roue</h2>
            <p className={`text-sm mt-1 ${probabilityStatusClass}`}>{probabilityStatusMessage}</p>
          </div>
          <button
            type="button"
            onClick={addSegment}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold text-sm"
          >
            + Ajouter un segment
          </button>
        </div>

        <div className="space-y-4">
          {segments.map((segment, index) => {
            const valueLabel = getSegmentValueLabel(segment.prize.type);
            const valuePlaceholder = getSegmentValuePlaceholder(segment.prize.type);
            const isValueDisabled = isPrizeValueDisabled(segment.prize.type);

            return (
              <div
                key={segment.id}
                className="bg-white/40 rounded-xl p-6 border-2 border-gray-200 hover:border-purple-300 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Couleur */}
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Couleur
                    </label>
                    <input
                      type="color"
                      value={segment.color}
                      onChange={(e) => updateSegment(index, { color: e.target.value })}
                      className="h-10 w-full rounded-lg cursor-pointer border-2 border-gray-200"
                    />
                  </div>

                  {/* Label */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Libellé
                    </label>
                    <input
                      type="text"
                      value={segment.label}
                      onChange={(e) => updateSegment(index, { label: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all outline-none text-sm text-gray-900"
                    />
                  </div>

                  {/* Type de prix */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Type de prix
                    </label>
                    <select
                      value={segment.prize.type}
                      onChange={(e) =>
                        updateSegment(index, {
                          prize: {
                            type: e.target.value as 'PRIZE' | 'DISCOUNT' | 'NOTHING',
                            value: segment.prize.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all outline-none text-sm text-gray-900"
                    >
                      <option value="PRIZE">Prix</option>
                      <option value="DISCOUNT">Réduction</option>
                      <option value="NOTHING">Rien</option>
                    </select>
                  </div>

                  {/* Valeur */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      {valueLabel}
                    </label>
                    <input
                      type="text"
                      value={segment.prize.value}
                      onChange={(e) =>
                        updateSegment(index, {
                          prize: { type: segment.prize.type, value: e.target.value },
                        })
                      }
                      disabled={isValueDisabled}
                      placeholder={valuePlaceholder}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all outline-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-500"
                    />
                  </div>

                  {/* Probabilité */}
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">%</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={segment.probability}
                      onChange={(e) =>
                        updateSegment(index, { probability: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all outline-none text-sm text-gray-900"
                    />
                  </div>

                  {/* Supprimer */}
                  <div className="md:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => removeSegment(index)}
                      className="w-full h-10 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
                      disabled={!canAddRemoveSegments}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        {showCancelButton && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="px-8 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer le jeu'}
        </button>
      </div>
    </form>
  );
}
