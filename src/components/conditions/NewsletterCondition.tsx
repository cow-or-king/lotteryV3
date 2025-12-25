/**
 * Newsletter Condition Component
 * Demande à l'utilisateur de s'inscrire à la newsletter
 * IMPORTANT: ZERO any types
 */

'use client';

import type { CampaignConditionData } from '@/types/condition.types';
import { useState } from 'react';

interface NewsletterConditionProps {
  condition: CampaignConditionData;
  onComplete: () => void;
  progressPercentage: number;
  currentStep: number;
  totalSteps: number;
}

export function NewsletterCondition({
  condition,
  onComplete,
  progressPercentage,
  currentStep,
  totalSteps,
}: NewsletterConditionProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      return;
    }

    setIsSubmitting(true);

    // Simuler un appel API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsComplete(true);

    // Auto-complete après succès
    setTimeout(() => {
      onComplete();
    }, 2000);
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
            className="h-full bg-linear-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
          <span className="text-3xl">{condition.iconEmoji || '📧'}</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {condition.title || 'Inscrivez-vous à notre newsletter'}
        </h1>
        <p className="text-xl text-gray-700">
          {condition.description || 'Restez informé de nos actualités et offres exclusives'}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border-2 border-green-500">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg ${
                isComplete ? 'bg-green-500' : 'bg-linear-to-br from-green-500 to-emerald-600'
              }`}
            >
              {isComplete ? '✓' : '📧'}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Votre adresse e-mail</h3>
            {!isComplete ? (
              <>
                <p className="text-gray-700 mb-4">
                  Entrez votre e-mail pour recevoir nos actualités et offres exclusives.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !email || !email.includes('@')}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Inscription en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>S'inscrire</span>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          ></path>
                        </svg>
                      </>
                    )}
                  </button>
                </form>
                <p className="text-xs text-gray-500 mt-3">
                  En vous inscrivant, vous acceptez de recevoir nos communications par e-mail.
                </p>
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="font-semibold">
                    Merci pour votre inscription ! Vous recevrez bientôt nos actualités.
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
