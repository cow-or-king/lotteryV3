/**
 * AnimatedBackground Component
 * Arrière-plan animé avec blobs organiques
 * IMPORTANT: ZERO any types
 */

'use client';

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'purple' | 'blue' | 'gradient';
  intensity?: 'light' | 'medium' | 'strong';
}

/**
 * Background avec blobs animés
 */
export function AnimatedBackground({
  className,
  variant = 'default',
  intensity = 'medium',
  children,
  ...props
}: AnimatedBackgroundProps) {
  const intensityOpacity = {
    light: 'opacity-20',
    medium: 'opacity-30',
    strong: 'opacity-40',
  };

  const getColors = () => {
    switch (variant) {
      case 'purple':
        return ['bg-purple-300', 'bg-pink-300', 'bg-indigo-300', 'bg-violet-300'];
      case 'blue':
        return ['bg-blue-300', 'bg-cyan-300', 'bg-sky-300', 'bg-indigo-300'];
      case 'gradient':
        return [
          'bg-gradient-to-r from-purple-300 to-pink-300',
          'bg-gradient-to-r from-yellow-300 to-orange-300',
          'bg-gradient-to-r from-green-300 to-blue-300',
          'bg-gradient-to-r from-red-300 to-purple-300',
        ];
      default:
        return ['bg-purple-300', 'bg-yellow-300', 'bg-pink-300', 'bg-blue-300'];
    }
  };

  const colors = getColors();

  return (
    <div className={cn('relative overflow-hidden', className)} {...props}>
      {/* Animated blobs */}
      <div className="absolute inset-0">
        <div
          className={`absolute top-0 -left-20 w-96 h-96 ${colors[0]} rounded-full mix-blend-multiply filter blur-3xl ${intensityOpacity[intensity]} animate-blob`}
        ></div>
        <div
          className={`absolute top-0 -right-20 w-96 h-96 ${colors[1]} rounded-full mix-blend-multiply filter blur-3xl ${intensityOpacity[intensity]} animate-blob animation-delay-2000`}
        ></div>
        <div
          className={`absolute -bottom-20 left-20 w-96 h-96 ${colors[2]} rounded-full mix-blend-multiply filter blur-3xl ${intensityOpacity[intensity]} animate-blob animation-delay-4000`}
        ></div>
        <div
          className={`absolute bottom-0 right-20 w-96 h-96 ${colors[3]} rounded-full mix-blend-multiply filter blur-3xl ${intensityOpacity[intensity]} animate-blob animation-delay-6000`}
        ></div>
      </div>

      {/* Content */}
      <div className="relative">{children}</div>

      {/* CSS pour les animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
}
