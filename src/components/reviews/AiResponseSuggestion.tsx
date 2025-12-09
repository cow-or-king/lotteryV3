/**
 * Composant AiResponseSuggestion
 * Affiche une suggestion de réponse générée par IA
 * IMPORTANT: ZERO any types, Single Responsibility
 */

'use client';

import { AlertCircle, Brain, CheckCircle, Sparkles } from 'lucide-react';

interface AiSuggestion {
  suggestedResponse: string;
  confidence: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  tokensUsed: number;
  provider: string;
  model: string;
}

interface AiResponseSuggestionProps {
  suggestion: AiSuggestion;
  onUse: () => void;
  isUsing?: boolean;
}

export function AiResponseSuggestion({
  suggestion,
  onUse,
  isUsing = false,
}: AiResponseSuggestionProps) {
  const sentimentConfig = {
    positive: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Positif' },
    neutral: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Neutre' },
    negative: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Négatif' },
  };

  const config = sentimentConfig[suggestion.sentiment];
  const SentimentIcon = config.icon;
  const confidencePercent = Math.round(suggestion.confidence * 100);

  return (
    <div className="border-2 border-purple-200 rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="p-1.5 sm:p-2 bg-purple-600 rounded-lg shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-gray-900 flex flex-wrap items-center gap-2 text-sm sm:text-base">
              <span>Suggestion IA</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} font-medium`}
              >
                {config.label}
              </span>
            </h4>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Brain className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {suggestion.model} · Confiance: {confidencePercent}%
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={onUse}
          disabled={isUsing}
          className="w-full sm:w-auto px-3 py-2 sm:px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:scale-100 shrink-0"
        >
          {isUsing ? 'Appliqué ✓' : 'Utiliser'}
        </button>
      </div>

      {/* Suggested Response Content */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-purple-100">
        <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {suggestion.suggestedResponse}
        </p>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <SentimentIcon className={`w-3.5 h-3.5 ${config.color} shrink-0`} />
          <span>Sentiment détecté: {config.label.toLowerCase()}</span>
        </div>
        <div className="shrink-0">
          {suggestion.tokensUsed} tokens · {suggestion.provider}
        </div>
      </div>
    </div>
  );
}
