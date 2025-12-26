/**
 * Custom Redirect Condition Component
 * Redirection personnalisée vers une URL
 * IMPORTANT: ZERO any types
 */

'use client';

import type { CampaignConditionData, CustomRedirectConfig } from '@/types/condition.types';
import { useEffect, useState } from 'react';

interface CustomRedirectConditionProps {
  condition: CampaignConditionData;
  onComplete: () => void;
  progressPercentage: number;
  currentStep: number;
  totalSteps: number;
}

// Helper functions extracted outside component
function getRandomDelay(): number {
  return Math.floor(Math.random() * 8) + 8;
}

function shouldOpenRedirect(url: string): boolean {
  return url !== '' && url !== '#';
}

function getStatusBadgeStyles(hasClicked: boolean): string {
  return hasClicked ? 'bg-green-500' : 'bg-linear-to-br from-purple-500 to-indigo-600';
}

function getStatusIcon(hasClicked: boolean): string {
  return hasClicked ? '✓' : '🔗';
}

function getStatusMessage(hasClicked: boolean, instructionText: string): string {
  return hasClicked ? 'Action complétée ! Vous pouvez maintenant continuer.' : instructionText;
}

function getVerificationMessage(countdown: number | null): string {
  const isCountdownActive = countdown !== null && countdown > 0;
  return isCountdownActive ? 'Vérification en cours...' : 'Action complétée !';
}

function extractConfig(condition: CampaignConditionData) {
  const config = condition.config as CustomRedirectConfig | null;
  return {
    redirectUrl: config?.redirectUrl || condition.redirectUrl || '#',
    buttonText: config?.buttonText || 'Continuer',
    instructionText: config?.instructionText || 'Cliquez pour continuer',
  };
}

function openRedirectInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function CustomRedirectCondition({ condition, onComplete }: CustomRedirectConditionProps) {
  const [hasClicked, setHasClicked] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { redirectUrl, buttonText, instructionText } = extractConfig(condition);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  const handleClick = () => {
    setHasClicked(true);

    const randomDelay = getRandomDelay();
    setCountdown(randomDelay);

    if (shouldOpenRedirect(redirectUrl)) {
      openRedirectInNewTab(redirectUrl);
    }

    setTimeout(() => {
      onComplete();
    }, randomDelay * 1000);
  };

  // Pre-compute display values
  const iconEmoji = condition.iconEmoji || '🔗';
  const title = condition.title || 'Action personnalisée';
  const description = condition.description || instructionText;
  const actionTitle = condition.title || 'Action requise';
  const badgeStyles = getStatusBadgeStyles(hasClicked);
  const statusIcon = getStatusIcon(hasClicked);
  const statusMessage = getStatusMessage(hasClicked, instructionText);
  const verificationMessage = getVerificationMessage(countdown);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-purple-500 to-indigo-600 rounded-full mb-4 shadow-lg">
          <span className="text-3xl">{iconEmoji}</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">{title}</h1>
        <p className="text-xl text-gray-700">{description}</p>
      </div>

      {/* Action Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border-2 border-purple-500">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg ${badgeStyles}`}
            >
              {statusIcon}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{actionTitle}</h3>
            <p className="text-gray-700 mb-4">{statusMessage}</p>

            {!hasClicked ? (
              <button
                onClick={handleClick}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-linear-to-r from-purple-500 to-indigo-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <span>{buttonText}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  ></path>
                </svg>
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
                  <span className="font-semibold">{verificationMessage}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
