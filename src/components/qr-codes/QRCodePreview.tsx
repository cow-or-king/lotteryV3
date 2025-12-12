'use client';

import { useEffect } from 'react';
import { QRCodeAnimation } from '@/lib/types/qr-code.types';

/**
 * Props for the QRCodePreview component
 */
interface QRCodePreviewProps {
  qrCodeDataUrl: string | null;
  animation: QRCodeAnimation | null;
  animationColor?: string;
  isGenerating: boolean;
}

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1] ?? 'ff', 16),
        g: parseInt(result[2] ?? 'ff', 16),
        b: parseInt(result[3] ?? 'ff', 16),
      }
    : { r: 139, g: 92, b: 246 }; // Default purple
}

/**
 * QRCodePreview component displays a preview of the generated QR code
 * with optional animations and loading states
 */
export default function QRCodePreview({
  qrCodeDataUrl,
  animation,
  animationColor = '#8b5cf6',
  isGenerating,
}: QRCodePreviewProps) {
  const rgb = hexToRgb(animationColor);
  const rgbaColor = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

  /**
   * Get the CSS class name based on the selected animation
   */
  const getAnimationClass = (): string => {
    if (!animation) {
      return '';
    }

    switch (animation) {
      case 'RIPPLE':
        return 'qr-ripple';
      case 'PULSE':
        return 'qr-pulse';
      case 'GLOW':
        return 'qr-glow';
      case 'ROTATE3D':
        return 'qr-rotate3d';
      case 'WAVE':
        return 'qr-wave';
      case 'CIRCULAR_RIPPLE':
        return 'qr-circular-ripple';
      case 'NONE':
      default:
        return '';
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
      {/* Animation styles */}
      <style jsx>{`
        .qr-ripple {
          transition: all 0.3s ease;
        }
        .qr-ripple:hover {
          animation: ripple 0.6s ease-out;
        }
        @keyframes ripple {
          0% {
            box-shadow:
              0 0 0 0 rgba(${rgbaColor}, 0.7),
              0 0 0 0 rgba(${rgbaColor}, 0.7);
          }
          50% {
            box-shadow:
              0 0 0 10px rgba(${rgbaColor}, 0.3),
              0 0 0 20px rgba(${rgbaColor}, 0.1);
          }
          100% {
            box-shadow:
              0 0 0 20px rgba(${rgbaColor}, 0),
              0 0 0 40px rgba(${rgbaColor}, 0);
          }
        }

        .qr-pulse {
          transition: all 0.3s ease;
        }
        .qr-pulse:hover {
          animation: pulse 1s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .qr-glow {
          transition: all 0.3s ease;
        }
        .qr-glow:hover {
          animation: glow 1.5s ease-in-out infinite;
        }
        @keyframes glow {
          0%,
          100% {
            box-shadow:
              0 0 20px rgba(${rgbaColor}, 0.5),
              0 0 30px rgba(${rgbaColor}, 0.3);
          }
          50% {
            box-shadow:
              0 0 40px rgba(${rgbaColor}, 0.8),
              0 0 60px rgba(${rgbaColor}, 0.5);
          }
        }

        .qr-rotate3d {
          transition: all 0.5s ease;
          transform-style: preserve-3d;
        }
        .qr-rotate3d:hover {
          transform: rotateY(15deg) rotateX(15deg);
        }

        .qr-wave {
          transition: all 0.3s ease;
        }
        .qr-wave:hover {
          animation: wave 2s ease-in-out infinite;
        }
        @keyframes wave {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-5px) rotate(1deg);
          }
          75% {
            transform: translateY(5px) rotate(-1deg);
          }
        }

        .qr-circular-ripple {
          transition: all 0.3s ease;
          position: relative;
        }
        .qr-circular-ripple:hover::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: circular-ripple 1s ease-out;
        }
        @keyframes circular-ripple {
          0% {
            box-shadow: 0 0 0 0 rgba(${rgbaColor}, 0.7);
          }
          50% {
            box-shadow: 0 0 0 30px rgba(${rgbaColor}, 0.3);
          }
          100% {
            box-shadow: 0 0 0 60px rgba(${rgbaColor}, 0);
          }
        }
      `}</style>

      {/* Glassmorphism container */}
      <div className="relative w-full max-w-md mx-auto p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Loading state */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-800">Generating QR code...</p>
            </div>
          )}

          {/* QR Code preview */}
          {!isGenerating && qrCodeDataUrl && (
            <div className="flex flex-col items-center space-y-4">
              <div className={`relative ${getAnimationClass()}`}>
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code Preview"
                  className="w-64 h-64 rounded-lg bg-white p-4"
                />
              </div>
              {animation && animation !== 'NONE' && (
                <p className="text-xs text-gray-700 italic font-medium">
                  Hover to preview animation
                </p>
              )}
            </div>
          )}

          {/* Empty state */}
          {!isGenerating && !qrCodeDataUrl && (
            <div className="flex flex-col items-center justify-center space-y-4 py-16">
              <div className="w-24 h-24 rounded-lg bg-white/20 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-700 text-center font-medium">
                Configure your QR code to see preview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
