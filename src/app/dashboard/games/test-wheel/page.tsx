/**
 * Test Wheel Game Page
 * Page de test pour la roue de la fortune
 */

'use client';

import { useState } from 'react';

import WheelGame from '@/components/games/WheelGame';
import { WheelEngine } from '@/lib/game-engines/wheel-engine';
import type { WheelSegment } from '@/lib/types/game.types';

export default function TestWheelPage() {
  const [result, setResult] = useState<WheelSegment | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Configuration par défaut de la roue
  const config = WheelEngine.createDefaultConfig();

  const handleSpinStart = () => {
    setIsSpinning(true);
    setResult(null);
  };

  const handleSpinComplete = (winningSegment: WheelSegment) => {
    setIsSpinning(false);
    setResult(winningSegment);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎡 Test de la Roue de la Fortune
          </h1>
          <p className="text-gray-600">
            Testez la roue avec feedback haptique (vibrations sur mobile)
          </p>
        </div>

        {/* Wheel Game */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8">
          <WheelGame
            config={config}
            primaryColor="#5B21B6"
            secondaryColor="#EC4899"
            vibrationEnabled={true}
            onSpinStart={handleSpinStart}
            onSpinComplete={handleSpinComplete}
          />
        </div>

        {/* Result Display */}
        {result && (
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              {result.prize.type === 'NOTHING' ? '😢 Dommage !' : '🎉 Félicitations !'}
            </h2>
            <div
              className="text-center p-6 rounded-2xl"
              style={{ backgroundColor: result.color + '20' }}
            >
              <p className="text-3xl font-bold mb-2" style={{ color: result.color }}>
                {result.label}
              </p>
              <p className="text-gray-600">
                {result.prize.type === 'PRIZE' && `Vous avez gagné: ${result.prize.value}`}
                {result.prize.type === 'DISCOUNT' && `Réduction de ${result.prize.value}%`}
                {result.prize.type === 'NOTHING' && 'Pas de chance cette fois-ci'}
              </p>
            </div>
          </div>
        )}

        {/* Configuration Info */}
        <div className="mt-8 bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuration de la roue</h2>
          <div className="space-y-4">
            {config.segments.map((segment) => (
              <div
                key={segment.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/40"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{segment.label}</p>
                    <p className="text-sm text-gray-600">
                      {segment.prize.type === 'PRIZE' && `Prix: ${segment.prize.value}`}
                      {segment.prize.type === 'DISCOUNT' && `Réduction: ${segment.prize.value}%`}
                      {segment.prize.type === 'NOTHING' && 'Aucun gain'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{segment.probability}%</p>
                  <p className="text-xs text-gray-500">probabilité</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-100/50 rounded-xl">
                <p className="text-2xl font-bold text-purple-600">{config.segments.length}</p>
                <p className="text-sm text-gray-600">Segments</p>
              </div>
              <div className="text-center p-4 bg-green-100/50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">
                  {config.segments
                    .filter((s) => s.prize.type !== 'NOTHING')
                    .reduce((sum, s) => sum + s.probability, 0)}
                  %
                </p>
                <p className="text-sm text-gray-600">Taux de gain</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50/60 backdrop-blur-xl rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📱 Instructions</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>
                <strong>Sur mobile:</strong> Activez les vibrations pour sentir chaque segment
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>
                <strong>Vibration douce:</strong> À chaque passage de segment (15ms)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>
                <strong>Vibration finale:</strong> Différente selon le résultat (win/lose)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>
                <strong>Animation:</strong> 3-7 tours complets avec ralentissement progressif
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
