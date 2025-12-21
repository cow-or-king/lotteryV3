/**
 * Instagram Follow Condition Component
 * Demande à l'utilisateur de suivre le compte Instagram
 * IMPORTANT: ZERO any types
 */

'use client';

import type { CampaignConditionData, InstagramFollowConfig } from '@/types/condition.types';
import { useEffect, useState } from 'react';

interface InstagramFollowConditionProps {
  condition: CampaignConditionData;
  onComplete: () => void;
  progressPercentage: number;
  currentStep: number;
  totalSteps: number;
}

export function InstagramFollowCondition({
  condition,
  onComplete,
  progressPercentage,
  currentStep,
  totalSteps,
}: InstagramFollowConditionProps) {
  const [hasClickedFollow, setHasClickedFollow] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const config = condition.config as InstagramFollowConfig | null;
  const instagramUrl = config?.instagramUrl || 'https://instagram.com';
  const username = config?.username || '';

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  const handleFollowClick = () => {
    setHasClickedFollow(true);

    // Timer aléatoire entre 10 et 20 secondes
    const randomDelay = Math.floor(Math.random() * 11) + 10;
    setCountdown(randomDelay);

    // Ouvrir Instagram dans un nouvel onglet
    window.open(instagramUrl, '_blank', 'noopener,noreferrer');

    // Auto-complete après le countdown
    setTimeout(() => {
      onComplete();
    }, randomDelay * 1000);
  };

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 text-sm font-medium">Progression</span>
          <span className="text-gray-700 text-sm font-medium">
            {currentStep}/{totalSteps}
          </span>
        </div>
        <div className="h-2 bg-white/70 backdrop-blur-xl rounded-full overflow-hidden border border-white/30">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4 shadow-lg">
          <span className="text-3xl">{condition.iconEmoji || '📸'}</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {condition.title || 'Suivez-nous sur Instagram'}
        </h1>
        <p className="text-xl text-gray-700">
          {condition.description || `Suivez @${username} pour continuer`}
        </p>
      </div>

      {/* Action Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border-2 border-pink-500">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg ${
                hasClickedFollow ? 'bg-green-500' : 'bg-gradient-to-br from-pink-500 to-purple-600'
              }`}
            >
              {hasClickedFollow ? '✓' : '📸'}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Suivre @{username}</h3>
            <p className="text-gray-700 mb-4">
              {hasClickedFollow
                ? 'Merci de nous avoir suivi ! Vous pouvez maintenant continuer.'
                : 'Cliquez pour ouvrir Instagram dans un nouvel onglet.'}
            </p>

            {!hasClickedFollow ? (
              <button
                onClick={handleFollowClick}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Suivre sur Instagram</span>
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="font-semibold">
                    {countdown !== null && countdown > 0
                      ? `Vérification en cours...`
                      : 'Condition complétée !'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
