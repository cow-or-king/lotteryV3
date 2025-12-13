/**
 * Wheel Preview Component
 * Preview interactif de la roue avec animation
 * IMPORTANT: ZERO any types
 */

'use client';

import { useState, useRef } from 'react';
import { WheelDesignConfig } from '@/lib/types/game-design.types';

interface WheelPreviewProps {
  design: WheelDesignConfig;
  size?: number;
  interactive?: boolean; // Si true, on peut cliquer pour tourner
}

export function WheelPreview({ design, size = 400, interactive = true }: WheelPreviewProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSpin = () => {
    if (!interactive || isSpinning) return;

    setIsSpinning(true);

    // Animation de rotation
    const spins = 5 + Math.random() * 3; // 5-8 tours
    const finalRotation = spins * 360 + Math.random() * 360;

    // Durée selon la config
    const duration = design.spinDuration || 4000;

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

  const segmentAngle = 360 / design.segments.length;

  return (
    <div
      className="relative w-full mx-auto flex items-center justify-center"
      style={{ aspectRatio: '1/1', maxWidth: size }}
    >
      {/* Wheel Container */}
      <div
        className={`relative w-full h-full rounded-full transition-transform ${
          interactive && !isSpinning ? 'cursor-pointer hover:scale-105' : ''
        }`}
        style={{
          backgroundColor: design.backgroundColor,
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
          {design.segments.map((segment, index) => {
            const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
            const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
            const radius = size / 2 - design.segmentBorderWidth;
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

            // Position du texte
            const textAngle = (index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
            const textRadius = radius * 0.7;
            const textX = centerX + textRadius * Math.cos(textAngle);
            const textY = centerY + textRadius * Math.sin(textAngle);

            return (
              <g key={segment.id}>
                {/* Segment */}
                <path
                  d={pathData}
                  fill={segment.color}
                  stroke={design.segmentBorderColor}
                  strokeWidth={design.segmentBorderWidth}
                />

                {/* Texte */}
                {design.showSegmentText && (
                  <text
                    x={textX}
                    y={textY}
                    fill={segment.textColor || '#FFFFFF'}
                    fontSize={design.textSize}
                    fontFamily={design.textFont}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${index * segmentAngle + segmentAngle / 2 + design.textRotation}, ${textX}, ${textY})`}
                  >
                    {segment.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Centre */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={design.centerCircleSize / 2}
            fill={design.centerCircleColor}
            stroke={design.segmentBorderColor}
            strokeWidth={design.segmentBorderWidth}
          />
        </svg>

        {/* Logo Central */}
        {design.centerLogoUrl && (
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden bg-white flex items-center justify-center"
            style={{
              width: design.centerLogoSize,
              height: design.centerLogoSize,
            }}
          >
            <img src={design.centerLogoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
        )}
      </div>

      {/* Pointeur (Arrow) */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        style={{
          width: 0,
          height: 0,
          borderLeft: '20px solid transparent',
          borderRight: '20px solid transparent',
          borderTop: `30px solid ${design.pointerColor}`,
        }}
      />

      {/* Click hint */}
      {interactive && !isSpinning && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-2 rounded-full whitespace-nowrap">
          Cliquez pour tester
        </div>
      )}

      {/* Spinning indicator */}
      {isSpinning && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-sm px-4 py-2 rounded-full animate-pulse">
          En rotation...
        </div>
      )}
    </div>
  );
}
