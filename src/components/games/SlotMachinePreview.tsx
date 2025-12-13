/**
 * Slot Machine Preview Component
 * Preview interactif de la machine à sous
 * IMPORTANT: ZERO any types
 */

'use client';

import { useState, useEffect } from 'react';
import { SlotMachineDesignConfig, SlotSymbol } from '@/lib/types/game-design.types';

interface SlotMachinePreviewProps {
  design: SlotMachineDesignConfig;
  interactive?: boolean;
}

export function SlotMachinePreview({ design, interactive = true }: SlotMachinePreviewProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelSymbols, setReelSymbols] = useState<string[][]>([]);
  const [finalSymbols, setFinalSymbols] = useState<string[]>([]);
  const [showWin, setShowWin] = useState(false);

  useEffect(() => {
    // Initialize reels with random symbols
    initializeReels();
  }, [design]);

  const initializeReels = () => {
    const initialReels: string[][] = [];
    const initialFinal: string[] = [];

    for (let i = 0; i < design.reelsCount; i++) {
      const reelSymbols: string[] = [];
      for (let j = 0; j < design.symbolsPerReel; j++) {
        const randomSymbol = design.symbols[Math.floor(Math.random() * design.symbols.length)];
        reelSymbols.push(randomSymbol?.icon || '🍒');
      }
      initialReels.push(reelSymbols);
      initialFinal.push(reelSymbols[Math.floor(design.symbolsPerReel / 2)] || '🍒');
    }

    setReelSymbols(initialReels);
    setFinalSymbols(initialFinal);
  };

  const handleSpin = () => {
    if (!interactive || isSpinning) return;

    setIsSpinning(true);
    setShowWin(false);

    // Generate random final symbols for each reel
    const newFinalSymbols: string[] = [];
    for (let i = 0; i < design.reelsCount; i++) {
      const randomSymbol = design.symbols[Math.floor(Math.random() * design.symbols.length)];
      newFinalSymbols.push(randomSymbol?.icon || '🍒');
    }

    // Animate reels stopping one by one
    const animateReels = async () => {
      for (let i = 0; i < design.reelsCount; i++) {
        await new Promise((resolve) => setTimeout(resolve, design.reelDelay));

        // Update reel to show final symbol
        setReelSymbols((prev) => {
          const newReels = [...prev];
          if (newReels[i]) {
            const middleIndex = Math.floor(design.symbolsPerReel / 2);
            newReels[i] =
              newReels[i]?.map((_, idx) =>
                idx === middleIndex ? newFinalSymbols[i] || '🍒' : newReels[i]?.[idx] || '🍒',
              ) || [];
          }
          return newReels;
        });
      }

      setFinalSymbols(newFinalSymbols);

      // Check for win
      setTimeout(() => {
        checkWin(newFinalSymbols);
        setIsSpinning(false);
      }, 500);
    };

    animateReels();
  };

  const checkWin = (symbols: string[]) => {
    // Check if all symbols match
    const allMatch = symbols.every((s) => s === symbols[0]);
    if (allMatch) {
      setShowWin(true);
    }
  };

  const getEasingClass = () => {
    switch (design.spinEasing) {
      case 'LINEAR':
        return 'ease-linear';
      case 'EASE_OUT':
        return 'ease-out';
      case 'BOUNCE':
        return 'ease-bounce';
      default:
        return 'ease-out';
    }
  };

  return (
    <div className="relative w-full mx-auto flex flex-col items-center justify-center gap-4">
      {/* Slot Machine Container */}
      <div
        className="relative rounded-3xl shadow-2xl p-8 border-8"
        style={{
          backgroundColor: design.backgroundColor,
          borderColor: design.reelBorderColor,
        }}
      >
        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">SLOT MACHINE</h3>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse animation-delay-2000"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse animation-delay-4000"></div>
          </div>
        </div>

        {/* Reels */}
        <div className="flex gap-3 mb-6">
          {reelSymbols.map((reel, reelIndex) => (
            <div
              key={reelIndex}
              className="relative rounded-xl overflow-hidden"
              style={{
                backgroundColor: '#FFFFFF',
                border: `4px solid ${design.reelBorderColor}`,
                width: `${300 / design.reelsCount}px`,
                height: '300px',
              }}
            >
              {/* Reel symbols */}
              <div
                className={`flex flex-col items-center justify-center h-full transition-transform ${
                  isSpinning ? `${getEasingClass()} animate-slot-spin` : ''
                }`}
              >
                {reel.map((symbol, symbolIndex) => {
                  const middleIndex = Math.floor(design.symbolsPerReel / 2);
                  const isMiddle = symbolIndex === middleIndex;

                  return (
                    <div
                      key={symbolIndex}
                      className={`flex items-center justify-center ${
                        isMiddle ? 'text-6xl' : 'text-4xl opacity-30'
                      }`}
                      style={{
                        height: `${100 / design.symbolsPerReel}%`,
                      }}
                    >
                      {symbol}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Spin Button */}
        {interactive && (
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-xl font-bold text-xl hover:from-yellow-500 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSpinning ? 'SPINNING...' : 'SPIN'}
          </button>
        )}
      </div>

      {/* Win notification */}
      {showWin && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl animate-fade-in">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-8 text-center shadow-2xl transform scale-110">
            <div className="text-7xl mb-4">🎰</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">JACKPOT!</h3>
            <p className="text-lg text-gray-800">Tous les symboles correspondent!</p>
          </div>
        </div>
      )}

      {/* Hint */}
      {interactive && !isSpinning && !showWin && (
        <div className="text-center text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow">
          Cliquez sur SPIN pour jouer
        </div>
      )}
    </div>
  );
}
