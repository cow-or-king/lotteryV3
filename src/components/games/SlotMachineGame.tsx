/**
 * SlotMachineGame Component
 * Machine à sous animée avec 3 rouleaux
 * Supporte le feedback haptique et la combinaison gagnante forcée
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { haptic } from '@/lib/utils/haptic-feedback';
import type { SlotMachineGameConfig } from '@/lib/types/game.types';

interface SlotMachineGameProps {
  config: SlotMachineGameConfig;
  primaryColor?: string;
  secondaryColor?: string;
  vibrationEnabled?: boolean;
  onSpinComplete?: (combination: [string, string, string]) => void;
  onSpinStart?: () => void;
  forcedCombination?: [string, string, string] | null; // Combinaison sur laquelle forcer l'arrêt
}

export default function SlotMachineGame({
  config,
  primaryColor = '#FBBF24',
  secondaryColor = '#DC2626',
  vibrationEnabled = true,
  onSpinComplete,
  onSpinStart,
  forcedCombination = null,
}: SlotMachineGameProps) {
  // Les hooks doivent être appelés AVANT tout return conditionnel
  const [isSpinning, setIsSpinning] = useState(false);
  const [_reelPositions, setReelPositions] = useState<[number, number, number]>([0, 0, 0]);
  const [reelSequences, setReelSequences] = useState<[string[], string[], string[]]>([[], [], []]);
  const reelRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  // Cleanup
  useEffect(() => {
    return () => {
      haptic.cancel();
    };
  }, []);

  // Validation de la config (APRÈS les hooks)
  if (!config.symbols || config.symbols.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="inline-block p-6 bg-red-50 rounded-lg">
          <p className="text-red-600 font-semibold mb-2">Configuration invalide</p>
          <p className="text-red-500 text-sm">
            La machine à sous ne contient pas de symboles. Veuillez vérifier la configuration du
            jeu.
          </p>
        </div>
      </div>
    );
  }

  /**
   * Génère une séquence aléatoire de symboles pour un rouleau
   */
  const generateReelSequence = (targetSymbol?: string): string[] => {
    const sequence: string[] = [];
    const symbolIcons = config.symbols.map((s) => s.icon);

    // Créer une longue séquence (50 symboles pour un spin fluide)
    for (let i = 0; i < 50; i++) {
      sequence.push(symbolIcons[Math.floor(Math.random() * symbolIcons.length)]!);
    }

    // Si on a un symbole cible, le placer à la fin
    if (targetSymbol) {
      sequence[sequence.length - 1] = targetSymbol;
    }

    return sequence;
  };

  /**
   * Lance la machine à sous
   */
  const handleSpin = () => {
    if (isSpinning) {
      return;
    }

    // Notifier le début du spin
    onSpinStart?.();
    setIsSpinning(true);

    // Vibration de début
    if (vibrationEnabled && haptic.isAvailable() && haptic.getEnabled()) {
      haptic.trigger('BUTTON');
    }

    // Générer les séquences pour chaque rouleau (une seule fois)
    const sequences: [string[], string[], string[]] = [
      generateReelSequence(forcedCombination?.[0]),
      generateReelSequence(forcedCombination?.[1]),
      generateReelSequence(forcedCombination?.[2]),
    ];

    // Sauvegarder les séquences dans le state pour éviter le re-render
    setReelSequences(sequences);

    // Animer chaque rouleau avec un délai différent
    const stopDelays = [0, 300, 600]; // Arrêt progressif des rouleaux

    sequences.forEach((sequence, reelIndex) => {
      const reel = reelRefs[reelIndex]?.current;
      if (!reel) {
        return;
      }

      // Calculer la position finale (dernier symbole)
      const symbolHeight = 120; // Hauteur d'un symbole en px
      const finalPosition = -(sequence.length - 1) * symbolHeight;

      // Animation CSS
      reel.style.transition = 'none';
      reel.style.transform = 'translateY(0)';

      // Forcer un reflow pour reset l'animation
      void reel.offsetHeight;

      // Démarrer l'animation après le délai
      setTimeout(() => {
        reel.style.transition = `transform ${config.spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
        reel.style.transform = `translateY(${finalPosition}px)`;

        // Vibration à l'arrêt de chaque rouleau
        setTimeout(() => {
          if (vibrationEnabled && haptic.isAvailable() && haptic.getEnabled()) {
            haptic.trigger('SEGMENT_TICK');
          }
        }, config.spinDuration);
      }, stopDelays[reelIndex]);

      // Sauvegarder la position du rouleau
      setTimeout(
        () => {
          setReelPositions((prev) => {
            const newPositions = [...prev] as [number, number, number];
            newPositions[reelIndex] = sequence.length - 1;
            return newPositions;
          });
        },
        config.spinDuration + (stopDelays[reelIndex] ?? 0),
      );
    });

    // Attendre que tous les rouleaux s'arrêtent
    const totalDuration = config.spinDuration + Math.max(...stopDelays);

    setTimeout(() => {
      // Vibration finale
      if (vibrationEnabled && haptic.isAvailable() && haptic.getEnabled()) {
        if (forcedCombination) {
          haptic.trigger('WHEEL_STOP_WIN');
        } else {
          haptic.trigger('WHEEL_STOP_LOSE');
        }
      }

      setIsSpinning(false);

      // Récupérer la combinaison finale
      const seq0 = sequences[0];
      const seq1 = sequences[1];
      const seq2 = sequences[2];

      if (!seq0 || !seq1 || !seq2) {
        console.error('Missing sequence data');
        return;
      }

      const symbol0 = seq0[seq0.length - 1];
      const symbol1 = seq1[seq1.length - 1];
      const symbol2 = seq2[seq2.length - 1];

      if (!symbol0 || !symbol1 || !symbol2) {
        console.error('Missing final symbols');
        return;
      }

      const finalCombination: [string, string, string] = [symbol0, symbol1, symbol2];

      // Attendre 2 secondes avant d'afficher le résultat
      setTimeout(() => {
        onSpinComplete?.(finalCombination);
      }, 2000);
    }, totalDuration);
  };

  /**
   * Render d'un rouleau
   */
  const renderReel = (reelIndex: number) => {
    // Utiliser la séquence sauvegardée si elle existe, sinon générer une séquence initiale
    const sequence =
      reelSequences[reelIndex] && reelSequences[reelIndex].length > 0
        ? reelSequences[reelIndex]
        : [config.symbols[0]?.icon || '❓'];

    return (
      <div
        key={reelIndex}
        className="relative overflow-hidden rounded-xl"
        style={{
          width: '100px',
          height: '120px',
          backgroundColor: config.backgroundColor,
          border: `4px solid ${config.reelBorderColor}`,
        }}
      >
        <div
          ref={reelRefs[reelIndex]}
          className="absolute left-0 top-0 w-full"
          style={{
            transform: 'translateY(0)',
          }}
        >
          {sequence.map((symbolIcon, index) => {
            const symbol = config.symbols.find((s) => s.icon === symbolIcon);
            return (
              <div
                key={`${reelIndex}-${index}`}
                className="flex items-center justify-center"
                style={{
                  height: '120px',
                  fontSize: '48px',
                  color: symbol?.color || '#FFFFFF',
                }}
              >
                {symbolIcon}
              </div>
            );
          })}
        </div>

        {/* Overlay de focus (ligne centrale) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom,
              rgba(0,0,0,0.5) 0%,
              rgba(0,0,0,0) 35%,
              rgba(0,0,0,0) 65%,
              rgba(0,0,0,0.5) 100%)`,
          }}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Machine à sous */}
      <div
        className="relative p-8 rounded-3xl shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}22 0%, ${secondaryColor}22 100%)`,
          border: `4px solid ${primaryColor}`,
        }}
      >
        {/* Titre */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold" style={{ color: primaryColor }}>
            SLOT MACHINE
          </h3>
        </div>

        {/* Rouleaux */}
        <div className="flex gap-4 mb-6">{[0, 1, 2].map((reelIndex) => renderReel(reelIndex))}</div>

        {/* Levier décoratif */}
        <div
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-6 h-24 rounded-full"
          style={{
            background: `linear-gradient(to bottom, ${secondaryColor}, ${primaryColor})`,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}
        />
      </div>

      {/* Bouton Spin */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className={`
          px-12 py-5 rounded-2xl font-bold text-2xl text-white
          transition-all duration-300 shadow-xl
          ${isSpinning ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95'}
        `}
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        {isSpinning ? 'EN COURS...' : 'JOUER'}
      </button>

      {/* Info vibration */}
      {vibrationEnabled && haptic.isAvailable() && (
        <p className="text-sm text-gray-500">Vibrations activées</p>
      )}
    </div>
  );
}
