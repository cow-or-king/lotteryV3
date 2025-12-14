/**
 * Slot Machine Preview Component
 * Preview interactif de la machine à sous
 * IMPORTANT: ZERO any types
 */

'use client';

import { SlotMachineDesignConfig } from '@/lib/types/game-design.types';
import { useEffect, useState } from 'react';

interface SlotMachinePreviewProps {
  design: SlotMachineDesignConfig;
  interactive?: boolean;
}

export function SlotMachinePreview({ design, interactive = true }: SlotMachinePreviewProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelSymbols, setReelSymbols] = useState<string[][]>([]);
  const [finalSymbols, setFinalSymbols] = useState<string[]>([]);
  const [showWin, setShowWin] = useState(false);
  const [stoppedReels, setStoppedReels] = useState<number[]>([]);
  const [hasTransition, setHasTransition] = useState(false);

  useEffect(() => {
    // Initialize reels with random symbols
    initializeReels();
  }, [design]);

  const initializeReels = () => {
    const initialReels: string[][] = [];
    const initialFinal: string[] = [];

    // Create MANY more symbols for smooth continuous spinning (50 symbols per reel)
    const symbolsToGenerate = 50;

    for (let i = 0; i < design.reelsCount; i++) {
      const reelSymbols: string[] = [];
      // Add random offset to desynchronize reels
      const offset = Math.floor(Math.random() * 10);

      for (let j = 0; j < symbolsToGenerate; j++) {
        const randomSymbol = design.symbols[(j + offset) % design.symbols.length];
        reelSymbols.push(randomSymbol?.icon || '🍒');
      }

      // Shuffle to make it more random
      const shuffled = [...reelSymbols].sort(() => Math.random() - 0.5);
      initialReels.push(shuffled);

      // Show the middle symbol
      initialFinal.push(shuffled[Math.floor(symbolsToGenerate / 2)] || '🍒');
    }

    setReelSymbols(initialReels);
    setFinalSymbols(initialFinal);
  };

  const handleSpin = () => {
    if (!interactive || isSpinning) {
      return;
    }

    setIsSpinning(true);
    setShowWin(false);
    setStoppedReels([]);
    setHasTransition(true);

    // Regenerate ALL reels with new random symbols to desynchronize
    const symbolsToGenerate = 50;
    const newReels: string[][] = [];

    for (let i = 0; i < design.reelsCount; i++) {
      const reelSymbols: string[] = [];
      // Different random offset for each reel
      const offset = Math.floor(Math.random() * design.symbols.length);

      for (let j = 0; j < symbolsToGenerate; j++) {
        const randomIndex = (j + offset) % design.symbols.length;
        const randomSymbol = design.symbols[randomIndex];
        reelSymbols.push(randomSymbol?.icon || '🍒');
      }

      // Shuffle to randomize
      const shuffled = [...reelSymbols].sort(() => Math.random() - 0.5);
      newReels.push(shuffled);
    }

    // Generate random final symbols for each reel
    const newFinalSymbols: string[] = [];
    for (let i = 0; i < design.reelsCount; i++) {
      const randomSymbol = design.symbols[Math.floor(Math.random() * design.symbols.length)];
      newFinalSymbols.push(randomSymbol?.icon || '🍒');

      // Place final symbol at position 15 immediately
      newReels[i]![15] = randomSymbol?.icon || '🍒';
    }

    setReelSymbols(newReels);
    setFinalSymbols(newFinalSymbols);

    // Animate reels stopping
    setTimeout(() => {
      setIsSpinning(false);

      // Check for win after a short delay
      setTimeout(() => {
        checkWin(newFinalSymbols);
      }, 200);
    }, design.spinDuration);
  };

  const checkWin = (symbols: string[]) => {
    // Check if all symbols match
    const allMatch = symbols.every((s) => s === symbols[0]);
    if (allMatch) {
      setShowWin(true);
    }
  };

  const getEasingValue = () => {
    switch (design.spinEasing) {
      case 'LINEAR':
        return 'linear';
      case 'EASE_OUT':
        return 'ease-out';
      case 'BOUNCE':
        return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
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
              {/* Reel symbols - infinite loop effect */}
              <div
                className="flex flex-col items-center"
                style={{
                  transform: isSpinning ? 'translateY(-5000px)' : 'translateY(-1400px)',
                  transition: isSpinning ? `transform ${design.spinDuration}ms linear` : 'none',
                  willChange: isSpinning ? 'transform' : 'auto',
                }}
              >
                {/* Duplicate symbols at start for seamless loop */}
                {reel.slice(-5).map((symbol, symbolIndex) => (
                  <div
                    key={`pre-${symbolIndex}`}
                    className="flex items-center justify-center text-6xl"
                    style={{
                      height: '100px',
                      minHeight: '100px',
                    }}
                  >
                    {symbol}
                  </div>
                ))}

                {/* Main reel symbols */}
                {reel.map((symbol, symbolIndex) => {
                  const isCenter = !isSpinning && symbolIndex === 15;
                  const isWinSymbol = showWin && isCenter;

                  return (
                    <div
                      key={symbolIndex}
                      className={`flex items-center justify-center text-6xl transition-all ${
                        isWinSymbol
                          ? 'border-4 border-green-500 rounded-xl bg-green-100 animate-pulse'
                          : ''
                      }`}
                      style={{
                        height: '100px',
                        minHeight: '100px',
                      }}
                    >
                      {symbol}
                    </div>
                  );
                })}

                {/* Duplicate symbols at end for seamless loop */}
                {reel.slice(0, 5).map((symbol, symbolIndex) => (
                  <div
                    key={`post-${symbolIndex}`}
                    className="flex items-center justify-center text-6xl"
                    style={{
                      height: '100px',
                      minHeight: '100px',
                    }}
                  >
                    {symbol}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Spin Button */}
        {interactive && (
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-4 bg-linear-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-xl font-bold text-xl hover:from-yellow-500 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSpinning ? 'SPINNING...' : 'SPIN'}
          </button>
        )}
      </div>

      {/* Win notification */}
      {showWin && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl animate-fade-in z-10">
          <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl p-8 text-center shadow-2xl transform scale-110 border-4 border-yellow-400">
            <div className="text-8xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">GAGNÉ!</h3>
            <div className="flex items-center justify-center gap-2 mb-2">
              {finalSymbols.map((symbol, idx) => (
                <span key={idx} className="text-5xl">
                  {symbol}
                </span>
              ))}
            </div>
            <p className="text-xl text-white font-semibold">3 symboles identiques!</p>
            <div className="mt-4 text-6xl animate-pulse">✨</div>
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
