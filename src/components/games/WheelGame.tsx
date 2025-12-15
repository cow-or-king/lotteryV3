/**
 * WheelGame Component
 * Composant interactif de roue de la fortune avec animations SVG
 * Intégration du feedback haptique synchronisé avec la rotation
 */

'use client';

import { useEffect, useRef, useState } from 'react';

import { haptic } from '@/lib/utils/haptic-feedback';
import type { WheelGameConfig, WheelSegment } from '@/lib/types/game.types';
import { type SpinResult, WheelEngine } from '@/lib/game-engines/wheel-engine';

interface WheelGameProps {
  config: WheelGameConfig;
  primaryColor?: string;
  secondaryColor?: string;
  vibrationEnabled?: boolean;
  logoUrl?: string | null;
  onSpinComplete?: (result: WheelSegment) => void;
  onSpinStart?: () => void;
  forcedSegmentId?: string | null; // ID du segment sur lequel forcer l'arrêt
}

export default function WheelGame({
  config,
  primaryColor = '#5B21B6',
  secondaryColor = '#EC4899',
  vibrationEnabled = true,
  logoUrl,
  onSpinComplete,
  onSpinStart,
  forcedSegmentId = null,
}: WheelGameProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<SVGGElement>(null);
  const engine = useRef(new WheelEngine(config));
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickAngleRef = useRef(0);
  const currentSpinResultRef = useRef<SpinResult | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
      haptic.cancel();
    };
  }, []);

  /**
   * Déclenche la vibration à chaque passage de segment
   */
  const triggerTickVibration = () => {
    if (vibrationEnabled && haptic.isAvailable() && haptic.getEnabled()) {
      haptic.trigger('SEGMENT_TICK');
    }
  };

  /**
   * Lance la roue
   */
  const handleSpin = () => {
    if (isSpinning) {
      return;
    }

    // Notifier le début du spin
    onSpinStart?.();
    setIsSpinning(true);

    // Obtenir le résultat du spin (avec segment forcé si fourni)
    console.log('🎰 Forcing segment ID:', forcedSegmentId);
    const result: SpinResult = engine.current.spin(forcedSegmentId || undefined);
    currentSpinResultRef.current = result;
    console.log('🎰 Spin result:', result);

    // Calculer le nombre de segments pour les ticks
    const segmentAngle = 360 / config.segments.length;
    const currentAngle = rotation % 360;
    lastTickAngleRef.current = Math.floor(currentAngle / segmentAngle);

    // Démarrer l'intervalle de tick vibration
    tickIntervalRef.current = setInterval(() => {
      const element = wheelRef.current;
      if (!element) {
        return;
      }

      // Récupérer la rotation actuelle depuis le transform
      const style = window.getComputedStyle(element);
      const matrix = style.transform;

      if (matrix && matrix !== 'none') {
        // Extraire l'angle de rotation depuis la matrice
        const values = matrix.split('(')[1]?.split(')')[0]?.split(',');
        if (values && values.length >= 6) {
          const a = parseFloat(values[0]!);
          const b = parseFloat(values[1]!);
          const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
          const normalizedAngle = (angle + 360) % 360;

          // Déterminer le segment actuel
          const currentSegment = Math.floor(normalizedAngle / segmentAngle);

          // Si on a changé de segment, déclencher la vibration
          if (currentSegment !== lastTickAngleRef.current) {
            triggerTickVibration();
            lastTickAngleRef.current = currentSegment;
          }
        }
      }
    }, 50); // Vérifier toutes les 50ms

    // Appliquer la rotation
    const newRotation = rotation + result.rotationDegrees;
    setRotation(newRotation);

    // Attendre la fin de l'animation
    setTimeout(() => {
      console.log('🎡 Wheel animation complete, winning segment:', result.winningSegment);

      // Arrêter les ticks
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }

      // Vibration finale selon le résultat
      if (vibrationEnabled && haptic.isAvailable() && haptic.getEnabled()) {
        if (result.winningSegment.prize && result.winningSegment.prize.type !== 'NOTHING') {
          haptic.trigger('WHEEL_STOP_WIN');
        } else {
          haptic.trigger('WHEEL_STOP_LOSE');
        }
      }

      setIsSpinning(false);

      // Notifier le résultat
      console.log('📢 Calling onSpinComplete callback');
      onSpinComplete?.(result.winningSegment);
      console.log('✅ onSpinComplete callback executed');
    }, result.spinDuration + 500); // +500ms pour laisser la roue se stabiliser
  };

  /**
   * Génère le path SVG pour un segment
   */
  const generateSegmentPath = (index: number, total: number): string => {
    const angle = 360 / total;
    const startAngle = (index * angle - 90) * (Math.PI / 180); // -90 pour commencer en haut
    const endAngle = ((index + 1) * angle - 90) * (Math.PI / 180);

    const radius = 45; // Rayon de la roue
    const cx = 50; // Centre X
    const cy = 50; // Centre Y

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const largeArc = angle > 180 ? 1 : 0;

    return `
      M ${cx},${cy}
      L ${x1},${y1}
      A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2}
      Z
    `;
  };

  /**
   * Calcule la position du texte pour un segment
   */
  const getTextPosition = (
    index: number,
    total: number,
  ): { x: number; y: number; rotation: number } => {
    const angle = 360 / total;
    const segmentAngle = (index * angle + angle / 2 - 90) * (Math.PI / 180);

    const textRadius = 30; // Distance du centre pour le texte
    const x = 50 + textRadius * Math.cos(segmentAngle);
    const y = 50 + textRadius * Math.sin(segmentAngle);
    const rotation = index * angle + angle / 2;

    return { x, y, rotation };
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Pointeur (triangle au-dessus de la roue) */}
      <div className="relative w-full max-w-md">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10"
          style={{
            width: 0,
            height: 0,
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderTop: `30px solid ${primaryColor}`,
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))',
          }}
        />

        {/* SVG Wheel */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-2xl"
          style={{
            filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',
          }}
        >
          <g
            ref={wheelRef}
            style={{
              transformOrigin: '50% 50%',
              transform: `rotate(${rotation}deg)`,
              transition:
                isSpinning && currentSpinResultRef.current
                  ? `transform ${currentSpinResultRef.current.spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                  : 'none',
            }}
          >
            {/* Segments */}
            {config.segments.map((segment, index) => {
              const textPos = getTextPosition(index, config.segments.length);
              return (
                <g key={segment.id}>
                  {/* Segment background */}
                  <path
                    d={generateSegmentPath(index, config.segments.length)}
                    fill={segment.color}
                    stroke="#FFFFFF"
                    strokeWidth="0.5"
                    className="transition-opacity hover:opacity-90"
                  />
                  {/* Segment text */}
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    fill="#FFFFFF"
                    fontSize="4"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                    style={{
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      pointerEvents: 'none',
                    }}
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}

            {/* Centre de la roue */}
            <circle cx="50" cy="50" r="10" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="0.5" />
            {logoUrl ? (
              <image
                href={logoUrl}
                x="42"
                y="42"
                width="16"
                height="16"
                clipPath="circle(8px at 50% 50%)"
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <circle cx="50" cy="50" r="7" fill={primaryColor} />
            )}
          </g>
        </svg>
      </div>

      {/* Bouton Spin */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className={`
          px-8 py-4 rounded-2xl font-bold text-xl text-white
          transition-all duration-300 shadow-xl
          ${isSpinning ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95'}
        `}
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        {isSpinning ? 'En cours...' : 'Tourner la roue'}
      </button>

      {/* Info vibration */}
      {vibrationEnabled && haptic.isAvailable() && (
        <p className="text-sm text-gray-500">Vibrations activées</p>
      )}
    </div>
  );
}
