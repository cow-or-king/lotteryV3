/**
 * Loyalty Program Condition Component
 * Demande à l'utilisateur de rejoindre le programme de fidélité
 * IMPORTANT: ZERO any types
 */

'use client';

import type { CampaignConditionData, LoyaltyProgramConfig } from '@/types/condition.types';
import { useEffect, useState } from 'react';

interface LoyaltyProgramConditionProps {
  condition: CampaignConditionData;
  onComplete: () => void;
  progressPercentage: number;
  currentStep: number;
  totalSteps: number;
}

export function LoyaltyProgramCondition({
  condition,
  onComplete,
  progressPercentage,
  currentStep,
  totalSteps,
}: LoyaltyProgramConditionProps) {
  const [hasClicked, setHasClicked] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const config = condition.config as LoyaltyProgramConfig | null;
  const programUrl = config?.programUrl || '#';
  const programName = config?.programName || 'Programme Fidélité';

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  const handleClick = () => {
    setHasClicked(true);

    // Timer aléatoire entre 10 et 15 secondes
    const randomDelay = Math.floor(Math.random() * 6) + 10;
    setCountdown(randomDelay);

    // Ouvrir l'URL dans un nouvel onglet
    if (programUrl && programUrl !== '#') {
      window.open(programUrl, '_blank', 'noopener,noreferrer');
    }

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
            className="h-full bg-gradient-to-r from-orange-500 to-amber-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full mb-4 shadow-lg">
          <span className="text-3xl">{condition.iconEmoji || '🎁'}</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {condition.title || `Rejoignez ${programName}`}
        </h1>
        <p className="text-xl text-gray-700">
          {condition.description || "Profitez d'avantages exclusifs et de récompenses"}
        </p>
      </div>

      {/* Action Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border-2 border-orange-500">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg ${
                hasClicked ? 'bg-green-500' : 'bg-gradient-to-br from-orange-500 to-amber-600'
              }`}
            >
              {hasClicked ? '✓' : '🎁'}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Inscription gratuite</h3>
            <p className="text-gray-700 mb-4">
              {hasClicked
                ? 'Merci de votre inscription ! Vous faites maintenant partie de notre communauté.'
                : `Rejoignez ${programName} et profitez d'avantages exclusifs.`}
            </p>

            {!hasClicked ? (
              <>
                <button
                  onClick={handleClick}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all mb-4"
                >
                  <span>Rejoindre {programName}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    ></path>
                  </svg>
                </button>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">✨ Avantages</h4>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• Réductions exclusives sur vos achats</li>
                    <li>• Points de fidélité cumulables</li>
                    <li>• Offres spéciales réservées aux membres</li>
                    <li>• Accès anticipé aux nouveautés</li>
                  </ul>
                </div>
              </>
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
                      : 'Bienvenue dans le programme !'}
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
