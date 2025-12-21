/**
 * TikTok Follow Condition Component
 * Demande à l'utilisateur de suivre le compte TikTok
 * IMPORTANT: ZERO any types
 */

'use client';

import type { CampaignConditionData, TikTokFollowConfig } from '@/types/condition.types';
import { useEffect, useState } from 'react';

interface TikTokFollowConditionProps {
  condition: CampaignConditionData;
  onComplete: () => void;
  progressPercentage: number;
  currentStep: number;
  totalSteps: number;
}

export function TikTokFollowCondition({
  condition,
  onComplete,
  progressPercentage,
  currentStep,
  totalSteps,
}: TikTokFollowConditionProps) {
  const [hasClickedFollow, setHasClickedFollow] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const config = condition.config as TikTokFollowConfig | null;
  const tiktokUrl = config?.tiktokUrl || 'https://tiktok.com';
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

    // Ouvrir TikTok dans un nouvel onglet
    window.open(tiktokUrl, '_blank', 'noopener,noreferrer');

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
            className="h-full bg-gradient-to-r from-black via-gray-800 to-gray-900 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-black to-gray-800 rounded-full mb-4 shadow-lg">
          <span className="text-3xl">{condition.iconEmoji || '🎵'}</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {condition.title || 'Suivez-nous sur TikTok'}
        </h1>
        <p className="text-xl text-gray-700">
          {condition.description || `Suivez @${username} pour continuer`}
        </p>
      </div>

      {/* Action Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border-2 border-black">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg ${
                hasClickedFollow ? 'bg-green-500' : 'bg-gradient-to-br from-black to-gray-800'
              }`}
            >
              {hasClickedFollow ? '✓' : '🎵'}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Suivre @{username}</h3>
            <p className="text-gray-700 mb-4">
              {hasClickedFollow
                ? 'Merci de nous avoir suivi ! Vous pouvez maintenant continuer.'
                : 'Cliquez pour ouvrir TikTok dans un nouvel onglet.'}
            </p>

            {!hasClickedFollow ? (
              <button
                onClick={handleFollowClick}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-black to-gray-800 text-white font-bold text-lg rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                <span>Suivre sur TikTok</span>
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
