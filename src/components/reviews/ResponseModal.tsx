/**
 * Modal de réponse à une review avec IA
 * IMPORTANT: ZERO any types, Composant de présentation pur
 */

'use client';

import { X, Sparkles, Loader2, Settings } from 'lucide-react';
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
  if (!isOpen || !review) return null;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen px-4 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true"></div>
        <div
          className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 max-h-[85vh] overflow-y-auto">
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

              {/* Star Rating Selector */}
              <StarRatingSelector
                value={responseStars}
                onChange={onResponseStarsChange}
                label="Ajouter des étoiles à votre réponse (optionnel)"
              />

              {/* AI Suggestion Button */}
              {aiServiceAvailable ? (
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
              ) : (
                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Service IA non configuré</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Activez l&apos;IA pour générer des réponses personnalisées automatiquement
                        et gagner du temps. Le service IA analyse le sentiment de l&apos;avis et
                        propose une réponse adaptée au ton sélectionné.
                      </p>
                      <button
                        type="button"
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Configurer le service IA
                      </button>
                    </div>
                  </div>
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

              {/* Warning */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  ⚠️ <strong>Attention:</strong> Une fois publiée, votre réponse ne pourra plus être
                  modifiée. Relisez bien avant d&apos;envoyer.
                </p>
              </div>

              {/* Action Buttons */}
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
                  onClick={onSubmit}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
