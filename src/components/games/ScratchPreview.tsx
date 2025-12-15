/**
 * Scratch Card Preview Component
 * Preview interactif de la carte à gratter
 * IMPORTANT: ZERO any types
 */

'use client';

import { useState, useEffect } from 'react';
import { ScratchDesignConfig } from '@/lib/types/game-design.types';

interface ScratchPreviewProps {
  design: ScratchDesignConfig;
  interactive?: boolean;
}

export function ScratchPreview({ design, interactive = true }: ScratchPreviewProps) {
  const [scratchedZones, setScratchedZones] = useState<Set<string>>(new Set());
  const [showWin, setShowWin] = useState(false);

  useEffect(() => {
    // Reset when design changes
    setScratchedZones(new Set());
    setShowWin(false);
  }, [design]);

  const handleZoneClick = (zoneId: string) => {
    if (!interactive || scratchedZones.has(zoneId)) return;

    const newScratched = new Set(scratchedZones);
    newScratched.add(zoneId);
    setScratchedZones(newScratched);

    // Check if all zones are scratched
    if (newScratched.size === design.zones.length) {
      setTimeout(() => checkWin(newScratched), design.revealDuration);
    }
  };

  const checkWin = (scratched: Set<string>) => {
    const scratchedZoneObjects = design.zones.filter((z) => scratched.has(z.id));

    if (design.winPattern === 'THREE_IN_ROW') {
      const symbols = scratchedZoneObjects.map((z) => z.content);
      const hasThreeInRow = symbols.every((s) => s === symbols[0]);
      setShowWin(hasThreeInRow);
    } else if (design.winPattern === 'ALL_MATCH') {
      const allMatch = scratchedZoneObjects.every((z) => z.isWinning);
      setShowWin(allMatch);
    } else if (design.winPattern === 'ANY_THREE') {
      const winningCount = scratchedZoneObjects.filter((z) => z.isWinning).length;
      setShowWin(winningCount >= 3);
    }
  };

  const handleReset = () => {
    setScratchedZones(new Set());
    setShowWin(false);
  };

  return (
    <div className="relative w-full mx-auto flex flex-col items-center justify-center gap-4">
      {/* Card Container */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-200"
        style={{
          width: design.cardWidth,
          height: design.cardHeight,
          maxWidth: '100%',
          aspectRatio: `${design.cardWidth}/${design.cardHeight}`,
        }}
      >
        {/* Background */}
        <div className="absolute inset-0" style={{ backgroundColor: design.backgroundColor }}>
          {/* Title */}
          <div className="absolute top-4 left-0 right-0 text-center">
            <h3 className="text-xl font-bold text-gray-700">Carte à gratter</h3>
            <p className="text-sm text-gray-500">Cliquez sur les zones pour gratter</p>
          </div>

          {/* Zones */}
          {design.zones.map((zone) => {
            const isScratched = scratchedZones.has(zone.id);
            return (
              <div
                key={zone.id}
                className={`absolute flex items-center justify-center transition-all duration-${design.revealDuration} ${
                  interactive && !isScratched ? 'cursor-pointer' : ''
                }`}
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                }}
                onClick={() => handleZoneClick(zone.id)}
              >
                {!isScratched ? (
                  // Scratch layer
                  <div
                    className={`w-full h-full rounded-lg flex items-center justify-center ${
                      interactive ? 'hover:scale-105' : ''
                    } transition-transform`}
                    style={{
                      backgroundColor: design.foregroundColor,
                      backgroundImage: design.scratchImage
                        ? `url(${design.scratchImage})`
                        : undefined,
                      backgroundSize: 'cover',
                    }}
                  >
                    <span className="text-white text-2xl font-bold opacity-50">?</span>
                  </div>
                ) : (
                  // Revealed content
                  <div
                    className={`w-full h-full rounded-lg flex items-center justify-center border-2 ${
                      zone.isWinning ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-white'
                    } ${design.scratchAnimation === 'FADE' ? 'animate-fade-in' : ''} ${
                      design.scratchAnimation === 'SHINE' ? 'animate-shine' : ''
                    }`}
                  >
                    <span className="text-5xl">{zone.content}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Win indicator */}
      {showWin && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl animate-fade-in">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">GAGNANT!</h3>
            <p className="text-gray-600">Vous avez gagné!</p>
          </div>
        </div>
      )}

      {/* Controls */}
      {interactive && (
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      )}

      {/* Hint */}
      {interactive && scratchedZones.size === 0 && (
        <div className="text-center text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow">
          Cliquez sur les cases pour révéler les symboles
        </div>
      )}
    </div>
  );
}
