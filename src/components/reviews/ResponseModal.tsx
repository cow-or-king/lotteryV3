/**
 * Modal de réponse à une review avec IA
 * IMPORTANT: ZERO any types, Composant de présentation pur
 */

'use client';

import { X, Sparkles, Loader2, Settings, Star, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { ReviewDTO } from '@/lib/types/review.types';
import { AiResponseSuggestion } from './AiResponseSuggestion';
import { StarRatingSelector } from './StarRatingSelector';

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

const toneOptions = [
  { value: 'professional' as const, label: 'Professionnel', emoji: '💼' },
  { value: 'friendly' as const, label: 'Amical', emoji: '😊' },
  { value: 'apologetic' as const, label: 'Conciliant', emoji: '🙏' },
];

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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [skipConfirmation, setSkipConfirmation] = useState(false);
  const [showAiAdvantages, setShowAiAdvantages] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);

  // Check localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('review-response-skip-confirmation');
    if (saved === 'true') {
      setSkipConfirmation(true);
    }
  }, []);

  // Scroll to modal when it opens
  useEffect(() => {
    if (isOpen && modalRef.current) {
      setTimeout(() => {
        modalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isOpen]);

  // Scroll to confirmation alert when it appears
  useEffect(() => {
    if (showConfirmation && confirmationRef.current) {
      setTimeout(() => {
        confirmationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showConfirmation]);

  if (!isOpen || !review) return null;

  const handleSubmitClick = () => {
    if (skipConfirmation) {
      onSubmit();
    } else {
      setShowConfirmation(true);
    }
  };

  const handleConfirmSubmit = () => {
    if (dontShowAgain) {
      localStorage.setItem('review-response-skip-confirmation', 'true');
      setSkipConfirmation(true);
    }
    setShowConfirmation(false);
    onSubmit();
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setDontShowAgain(false);
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
          style={{ maxHeight: 'calc(100vh - 100px)' }}
        >
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Répondre à l&apos;avis</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {review.authorName} · {renderStars(review.rating)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Original Review */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Avis original
                </p>
                <p className="text-gray-800 leading-relaxed">
                  {review.comment || '(Aucun commentaire écrit)'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Publié le {new Date(review.publishedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {/* Tone Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Ton de la réponse
                </label>
                <div className="flex gap-2">
                  {toneOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onToneChange(option.value)}
                      className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                        selectedTone === option.value
                          ? 'bg-purple-600 text-white shadow-lg scale-105'
                          : 'bg-white border-2 border-purple-200 text-gray-700 hover:border-purple-400'
                      }`}
                    >
                      <span className="mr-2">{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Service Status - Inline */}
              {!aiServiceAvailable && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
                  <div className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800">
                        Service IA non configuré
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAiAdvantages(!showAiAdvantages)}
                        className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-amber-300 text-amber-700 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                      >
                        {showAiAdvantages ? 'Masquer' : 'Voir les avantages'}
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Configurer
                      </button>
                    </div>
                  </div>

                  {/* Expandable Advantages Section */}
                  {showAiAdvantages && (
                    <div className="px-4 pb-4 pt-2 border-t border-amber-200 bg-amber-50/50">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                        Avantages du service IA :
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>
                            <strong>Gain de temps :</strong> Génération automatique de réponses
                            personnalisées en quelques secondes
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>
                            <strong>Analyse de sentiment :</strong> L&apos;IA détecte l&apos;émotion
                            de l&apos;avis (positif, neutre, négatif)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>
                            <strong>Ton adapté :</strong> Réponses professionnelles, amicales ou
                            conciliantes selon votre choix
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>
                            <strong>Modifiable :</strong> Vous gardez le contrôle et pouvez ajuster
                            la réponse avant envoi
                          </span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

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
                  rows={8}
                  value={responseContent}
                  onChange={(e) => onResponseContentChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all resize-none"
                  placeholder="Écrivez votre réponse ici, ou générez une suggestion IA..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {responseContent.length} caractères · Minimum 10 caractères
                </p>
              </div>

              {/* Confirmation Alert */}
              {showConfirmation && (
                <div
                  ref={confirmationRef}
                  className="p-4 bg-red-50 border-2 border-red-300 rounded-xl animate-pulse"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-red-900 mb-1">
                        Attention - Action irréversible
                      </h4>
                      <p className="text-sm text-red-800 mb-2">
                        Une fois publiée, votre réponse{' '}
                        <strong>
                          ne pourra plus être modifiée ni supprimée via cette interface
                        </strong>
                        . Assurez-vous que votre message est correct avant de l&apos;envoyer.
                      </p>
                      <p className="text-xs text-gray-700 bg-white/50 p-2 rounded border border-gray-200">
                        <strong>Note :</strong> Vous pourrez modifier ou supprimer votre réponse
                        ultérieurement en vous connectant directement à votre{' '}
                        <a
                          href="https://business.google.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          compte Google Business
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="dont-show-again"
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <label
                        htmlFor="dont-show-again"
                        className="text-xs text-gray-700 cursor-pointer"
                      >
                        Ne plus afficher cette alerte
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCancelConfirmation}
                        className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmSubmit}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
                      >
                        Confirmer et envoyer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons - Cachés si confirmation affichée */}
              {!showConfirmation && (
                <div className="flex gap-3 pt-4">
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
