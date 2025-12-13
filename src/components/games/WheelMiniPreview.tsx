/**
 * Wheel Mini Preview Component
 * Preview interactif de la roue mini (version simplifiée)
 * IMPORTANT: ZERO any types
 */

'use client';

import { useState } from 'react';
import { WheelMiniDesignConfig } from '@/lib/types/game-design.types';

interface WheelMiniPreviewProps {
  design: WheelMiniDesignConfig;
  size?: number;
  interactive?: boolean;
}

export function WheelMiniPreview({
  design,
  size = 350,
  interactive = true,
}: WheelMiniPreviewProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpin = () => {
    if (!interactive || isSpinning) return;

    setIsSpinning(true);

    // Animation de rotation rapide
    const spins = 3 + Math.random() * 2; // 3-5 tours (moins que la roue normale)
    const finalRotation = spins * 360 + Math.random() * 360;

    // Durée selon la config (plus rapide que la roue normale)
    const duration = design.spinDuration;

    // Animation avec easing
    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentRotation = startRotation + finalRotation * easeProgress;
      setRotation(currentRotation % 360);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
      }
    };

    animate();
  };

  const segmentAngle = 360 / design.segments;

  return (
    <div
      className="relative w-full mx-auto flex items-center justify-center"
      style={{ aspectRatio: '1/1', maxWidth: size }}
    >
      {/* Wheel Container */}
      <div
        className={`relative w-full h-full rounded-full transition-transform ${
          interactive && !isSpinning ? 'cursor-pointer hover:scale-105' : ''
        } shadow-2xl`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'none' : 'transform 0.3s ease',
        }}
        onClick={handleSpin}
      >
        {/* Segments SVG */}
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {Array.from({ length: design.segments }).map((_, index) => {
            const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
            const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
            const radius = size / 2;
            const centerX = size / 2;
            const centerY = size / 2;

            // Calcul des points du segment
            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);

            const largeArcFlag = segmentAngle > 180 ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z',
            ].join(' ');

            // Couleur alternée
            const color = design.colors[index % design.colors.length] || '#8B5CF6';

            // Gradient si style GRADIENT
            const gradientId = `gradient-${index}`;
            const useGradient = design.style === 'GRADIENT';

            return (
              <g key={index}>
                {useGradient && (
                  <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
                      <stop
                        offset="100%"
                        style={{
                          stopColor: adjustBrightness(color, -20),
                          stopOpacity: 1,
                        }}
                      />
                    </linearGradient>
                  </defs>
                )}

                {/* Segment */}
                <path
                  d={pathData}
                  fill={useGradient ? `url(#${gradientId})` : color}
                  stroke="#FFFFFF"
                  strokeWidth={3}
                />

                {/* Numéro du segment */}
                <text
                  x={
                    centerX +
                    radius *
                      0.65 *
                      Math.cos((index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180))
                  }
                  y={
                    centerY +
                    radius *
                      0.65 *
                      Math.sin((index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180))
                  }
                  fill="#FFFFFF"
                  fontSize={size / 10}
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {index + 1}
                </text>
              </g>
            );
          })}

          {/* Centre */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 8}
            fill="#FFFFFF"
            stroke="#E5E7EB"
            strokeWidth={3}
          />
        </svg>

        {/* Center icon */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl">
          ⚡
        </div>
      </div>

      {/* Pointeur (Arrow) */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        style={{
          width: 0,
          height: 0,
          borderLeft: '15px solid transparent',
          borderRight: '15px solid transparent',
          borderTop: '25px solid #EF4444',
        }}
      />

      {/* Click hint */}
      {interactive && !isSpinning && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-2 rounded-full whitespace-nowrap">
          Cliquez pour tourner
        </div>
      )}

      {/* Spinning indicator */}
      {isSpinning && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-2 rounded-full animate-pulse">
          Rotation rapide...
        </div>
      )}
    </div>
  );
}

// Helper function to adjust color brightness
function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
