/**
 * Slot Machine Preview Component
 * Preview interactif de la machine à sous
 * IMPORTANT: ZERO any types
 */

'use client';

import { SlotMachineDesignConfig } from '@/lib/types/game';
import { useEffect, useState } from 'react';

interface SlotMachinePreviewProps {
  design: SlotMachineDesignConfig;
  interactive?: boolean;
}

interface WinResult {
  matchCount: 2 | 3;
  symbol: string;
  matchingIndices: number[];
  label: string;
  multiplier: number;
}

export function SlotMachinePreview({ design, interactive = true }: SlotMachinePreviewProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelSymbols, setReelSymbols] = useState<string[][]>([]);
  const [finalSymbols, setFinalSymbols] = useState<string[]>([]);
  const [winResult, setWinResult] = useState<WinResult | null>(null);

  useEffect(() => {
    // Initialize reels with random symbols
    initializeReels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setWinResult(null);

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
    // Position calculation: translateY(-1400px) with 5 duplicated symbols at start (500px)
    // Visible window is 300px (3 symbols), center is at: (1400 - 500) / 100 + 1 = 10
    const centerPosition = 10;

    for (let i = 0; i < design.reelsCount; i++) {
      const randomSymbol = design.symbols[Math.floor(Math.random() * design.symbols.length)];
      newFinalSymbols.push(randomSymbol?.icon || '🍒');

      // Place final symbol at calculated center position
      newReels[i]![centerPosition] = randomSymbol?.icon || '🍒';
    }

    setReelSymbols(newReels);
    setFinalSymbols(newFinalSymbols);

    // Stop spinning and check for win after duration
    setTimeout(() => {
      setIsSpinning(false);

      // Check for win after reels stopped
      setTimeout(() => {
        checkWin(newFinalSymbols);
      }, 800);
    }, design.spinDuration);
  };

  const checkWin = (symbols: string[]) => {
    // Count occurrences of each symbol
    const symbolCounts = new Map<string, number[]>();
    symbols.forEach((symbol, index) => {
      const indices = symbolCounts.get(symbol) || [];
      indices.push(index);
      symbolCounts.set(symbol, indices);
    });

    // Find the symbol with most matches
    type BestMatch = { symbol: string; indices: number[]; count: number };
    let bestMatch: BestMatch | null = null;
    for (const [symbol, indices] of symbolCounts.entries()) {
      if (!bestMatch || indices.length > bestMatch.count) {
        bestMatch = { symbol, indices, count: indices.length };
      }
    }

    // Check if we have a winning pattern (2 or 3 matching symbols)
    if (bestMatch && bestMatch.count >= 2) {
      // Find matching win pattern from design
      const matchingPattern = design.winPatterns.find(
        (pattern) =>
          pattern.symbol === bestMatch!.symbol && pattern.matchCount === bestMatch!.count,
      );

      if (matchingPattern) {
        setWinResult({
          matchCount: bestMatch.count as 2 | 3,
          symbol: bestMatch.symbol,
          matchingIndices: bestMatch.indices,
          label: matchingPattern.label,
          multiplier: matchingPattern.multiplier,
        });
      } else {
        // Generic win without specific pattern
        setWinResult({
          matchCount: bestMatch.count as 2 | 3,
          symbol: bestMatch.symbol,
          matchingIndices: bestMatch.indices,
          label: bestMatch.count === 3 ? 'JACKPOT!' : 'Petit gain',
          multiplier: bestMatch.count === 3 ? 10 : 2,
        });
      }
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
                  const centerPosition = 10; // Same as calculated above
                  const isCenter = !isSpinning && symbolIndex === centerPosition;
                  const isWinSymbol =
                    winResult && isCenter && winResult.matchingIndices.includes(reelIndex);

                  // Different border colors based on match count
                  let borderStyle = '';
                  if (isWinSymbol) {
                    if (winResult.matchCount === 3) {
                      borderStyle =
                        'border-4 border-green-500 rounded-xl bg-green-100 animate-pulse';
                    } else if (winResult.matchCount === 2) {
                      borderStyle =
                        'border-4 border-yellow-500 rounded-xl bg-yellow-100 animate-pulse';
                    }
                  }

                  return (
                    <div
                      key={symbolIndex}
                      className={`flex items-center justify-center text-6xl transition-all ${borderStyle}`}
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
      {winResult && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl animate-fade-in z-10">
          <div
            className={`rounded-2xl p-8 text-center shadow-2xl transform scale-110 border-4 ${
              winResult.matchCount === 3
                ? 'bg-linear-to-br from-green-400 to-emerald-600 border-yellow-400'
                : 'bg-linear-to-br from-yellow-400 to-orange-500 border-yellow-300'
            }`}
          >
            <div className="text-8xl mb-4 animate-bounce">
              {winResult.matchCount === 3 ? '🎉' : '🎊'}
            </div>
            <h3 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{winResult.label}</h3>
            <div className="flex items-center justify-center gap-2 mb-2">
              {finalSymbols.map((symbol, idx) => (
                <span
                  key={idx}
                  className={`text-5xl ${winResult.matchingIndices.includes(idx) ? 'scale-125' : 'opacity-50'}`}
                >
                  {symbol}
                </span>
              ))}
            </div>
            <p className="text-xl text-white font-semibold">
              {winResult.matchCount} symboles identiques!
            </p>
            <p className="text-lg text-white/90 mt-2">Multiplicateur: x{winResult.multiplier}</p>
            <div className="mt-4 text-6xl animate-pulse">✨</div>
          </div>
        </div>
      )}

      {/* Hint */}
      {interactive && !isSpinning && !winResult && (
        <div className="text-center text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow">
          Cliquez sur SPIN pour jouer
        </div>
      )}
    </div>
  );
}
