/**
 * Google Review Condition Component
 * Demande à l'utilisateur de laisser un avis Google
 * IMPORTANT: ZERO any types
 */

'use client';

import type { CampaignConditionData, GoogleReviewConfig } from '@/types/condition.types';
import { useEffect, useState } from 'react';

interface GoogleReviewConditionProps {
  condition: CampaignConditionData;
  onComplete: () => void;
  progressPercentage: number;
  currentStep: number;
  totalSteps: number;
}

export function GoogleReviewCondition({ condition, onComplete }: GoogleReviewConditionProps) {
  const config = condition.config as GoogleReviewConfig | null;
  // Nettoyer l'URL : supprimer le tiret final s'il existe
  const rawUrl =
    config?.googleReviewUrl ||
    condition.redirectUrl ||
    'https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID';
  const googleReviewUrl = rawUrl.endsWith('-') ? rawUrl.slice(0, -1) : rawUrl;
  const [showPopup, setShowPopup] = useState(false);
  const [hasClickedReview, setHasClickedReview] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (isWaiting && countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isWaiting, countdown]);

  const handleReviewClick = () => {
    setShowPopup(true);
  };

  const handleConfirmReview = () => {
    setShowPopup(false);
    setHasClickedReview(true);
    setIsWaiting(true);

    // Timer aléatoire entre 15 et 25 secondes
    const randomDelay = Math.floor(Math.random() * 11) + 15;
    setCountdown(randomDelay);

    // Ouvrir le lien Google Avis dans un nouvel onglet
    window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 text-sm font-medium">Progression</span>
          <span className="text-gray-700 text-sm font-medium">1/2</span>
        </div>
        <div className="h-2 bg-white/70 backdrop-blur-xl rounded-full overflow-hidden border border-white/30">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
            style={{ width: '50%' }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4 shadow-lg">
          <span className="text-3xl">✍️</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Bienvenue !</h1>
        <p className="text-xl text-gray-700">Votre avis nous aide à nous améliorer</p>
      </div>

      {/* Checklist Steps */}
      <div className="space-y-6">
        {/* Step 1 - Active */}
        <div
          className={`backdrop-blur-xl rounded-2xl p-6 shadow-lg transition-all ${
            hasClickedReview
              ? 'bg-white/40 border border-white/30'
              : 'bg-white/70 border-2 border-purple-600'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg ${
                  hasClickedReview
                    ? 'bg-green-500'
                    : 'bg-gradient-to-br from-purple-600 to-pink-600'
                }`}
              >
                {hasClickedReview ? '✓' : '1'}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Partagez votre expérience sur Google
              </h3>
              <p className="text-gray-700 mb-4">
                {hasClickedReview
                  ? "Merci d'avoir publié votre avis. Vous allez pouvoir accéder au jeu de la chance !"
                  : 'Cliquez pour ouvrir Google Avis dans un nouvel onglet.'}
              </p>

              {!hasClickedReview && (
                <button
                  onClick={handleReviewClick}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-900 font-bold text-lg rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all shadow-xl border border-gray-200"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Laisser mon avis Google</span>
                </button>
              )}

              {/* {hasClickedReview && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <p className="text-blue-800 text-sm">
                      <strong>Rappel :</strong> Revenez ici après avoir publié votre avis pour
                      débloquer la roue de la chance !
                    </p>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Step 2 - Waiting */}
        <div
          className={`backdrop-blur-xl rounded-2xl p-6 shadow-lg transition-all ${
            countdown === 0
              ? 'bg-white/70 border-2 border-green-500'
              : 'bg-white/40 border border-white/30'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  countdown === 0 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                }`}
              >
                {countdown === 0 ? '✓' : '2'}
              </div>
            </div>
            <div className="flex-1">
              <h3
                className={`text-xl font-bold mb-2 ${
                  countdown === 0 ? 'text-gray-800' : 'text-gray-500'
                }`}
              >
                Tournez la roue et gagnez
              </h3>
              {countdown === 0 ? (
                <>
                  <p className="text-green-600 font-semibold mb-4">
                    🎉 Accès débloqué ! Vous pouvez maintenant jouer
                  </p>
                  <button
                    onClick={onComplete}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    <span>🎮</span>
                    <span>Accéder au jeu</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      ></path>
                    </svg>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="text-sm">Se débloque après l'étape 1</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timer Info */}
      {isWaiting && countdown !== null && countdown > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-xl border border-white/30 rounded-full text-gray-700 text-sm shadow-lg">
            <svg
              className="w-4 h-4 animate-spin-reverse text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            <span>Vérification en cours...</span>
          </div>
        </div>
      )}

      {/* Popup de confirmation */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Information importante</h3>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <p className="text-blue-800 text-sm">
                  <strong>Rappel :</strong> Revenez ici après avoir publié votre avis pour débloquer
                  le jeux de la chance !
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmReview}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Ouvrir Google Avis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
