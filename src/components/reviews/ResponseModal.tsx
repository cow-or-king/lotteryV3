/**
 * Modal de réponse à une review avec IA
 * IMPORTANT: ZERO any types, Composant orchestrateur, Mobile-first responsive
 */

'use client';

import type { ReviewDTO } from '@/lib/types/review.types';
import { Loader2, Sparkles, Star, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { AiResponseSuggestion } from './AiResponseSuggestion';
import { StarRatingSelector } from './StarRatingSelector';
import { ToneSelector, AiServiceBanner, ConfirmationAlert } from './modal';
import { useConfirmation } from '@/hooks/reviews';

interface AiSuggestion {
  suggestedResponse: string;
  confidence: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  tokensUsed: number;
  provider: string;
  model: string;
}

interface ResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: ReviewDTO | null;
  responseContent: string;
  responseStars: number;
  onResponseContentChange: (value: string) => void;
  onResponseStarsChange: (stars: number) => void;
  selectedTone: 'professional' | 'friendly' | 'apologetic';
  onToneChange: (tone: 'professional' | 'friendly' | 'apologetic') => void;
  aiSuggestion: AiSuggestion | null;
  aiServiceAvailable: boolean;
  onGenerateAi: () => void;
  onUseAiSuggestion: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isGeneratingAi: boolean;
}

const MODAL_MAX_HEIGHT = 'calc(100vh - 100px)';

export function ResponseModal({
  isOpen,
  onClose,
  review,
  responseContent,
  responseStars,
  onResponseContentChange,
  onResponseStarsChange,
  selectedTone,
  onToneChange,
  aiSuggestion,
  aiServiceAvailable,
  onGenerateAi,
  onUseAiSuggestion,
  onSubmit,
  isSubmitting,
  isGeneratingAi,
}: ResponseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmation = useConfirmation();

  // Scroll to modal when it opens
  useEffect(() => {
    if (isOpen && modalRef.current) {
      setTimeout(() => {
        modalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen || !review) return null;

  const handleSubmitClick = () => {
    if (confirmation.skipConfirmation) {
      onSubmit();
    } else {
      confirmation.requestConfirmation();
    }
  };

  const handleConfirm = () => {
    confirmation.confirmAction(onSubmit);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 inline-block ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Container - Bottom aligned */}
      <div className="absolute inset-0 flex items-end justify-center p-4 overflow-y-auto">
        <div
          ref={modalRef}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-4"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: MODAL_MAX_HEIGHT }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: MODAL_MAX_HEIGHT }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div>
                <h3 id="modal-title" className="text-xl sm:text-2xl font-bold text-gray-900">
                  Répondre à l&apos;avis
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {review.authorName} · {renderStars(review.rating)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fermer le modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {/* Original Review */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Avis original
                </p>
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                  {review.comment || '(Aucun commentaire écrit)'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Publié le {new Date(review.publishedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {/* Tone Selector */}
              <ToneSelector selectedTone={selectedTone} onToneChange={onToneChange} />

              {/* AI Service Banner */}
              {!aiServiceAvailable && <AiServiceBanner />}

              {/* Star Rating Selector */}
              <StarRatingSelector
                value={responseStars}
                onChange={onResponseStarsChange}
                label="Ajouter des étoiles à votre réponse (optionnel)"
              />

              {/* AI Suggestion Button */}
              {aiServiceAvailable && (
                <div>
                  <button
                    type="button"
                    onClick={onGenerateAi}
                    disabled={isGeneratingAi}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Générer une suggestion IA
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* AI Suggestion Display */}
              {aiSuggestion && (
                <AiResponseSuggestion
                  suggestion={aiSuggestion}
                  onUse={onUseAiSuggestion}
                  isUsing={responseContent.includes(aiSuggestion.suggestedResponse)}
                />
              )}

              {/* Response Textarea */}
              <div>
                <label
                  htmlFor="response"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Votre réponse
                </label>
                <textarea
                  id="response"
                  rows={6}
                  value={responseContent}
                  onChange={(e) => onResponseContentChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all resize-none text-sm sm:text-base"
                  placeholder="Écrivez votre réponse ici, ou générez une suggestion IA..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {responseContent.length} caractères · Minimum 10 caractères
                </p>
              </div>

              {/* Confirmation Alert */}
              {confirmation.showConfirmation && (
                <ConfirmationAlert
                  dontShowAgain={confirmation.dontShowAgain}
                  onDontShowAgainChange={confirmation.setDontShowAgain}
                  onConfirm={handleConfirm}
                  onCancel={confirmation.cancelConfirmation}
                  isSubmitting={isSubmitting}
                />
              )}

              {/* Action Buttons - Hidden when confirmation is shown */}
              {!confirmation.showConfirmation && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-white hover:bg-gray-50 disabled:bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitClick}
                    disabled={isSubmitting || responseContent.trim().length < 10}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:scale-100 shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer la réponse'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
