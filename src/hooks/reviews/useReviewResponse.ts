/**
 * Hook useReviewResponse
 * Gestion des réponses aux avis Google avec suggestions IA
 * IMPORTANT: ZERO any types, architecture modulaire
 */

'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import type { ReviewDTO } from '@/lib/types/review.types';

interface AiSuggestion {
  suggestedResponse: string;
  confidence: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  tokensUsed: number;
  provider: string;
  model: string;
}

export function useReviewResponse() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewDTO | null>(null);
  const [responseContent, setResponseContent] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [selectedTone, setSelectedTone] = useState<'professional' | 'friendly' | 'apologetic'>(
    'friendly',
  );

  const utils = api.useUtils();

  // Mutation: Répondre à un avis
  const respondMutation = api.review.respond.useMutation({
    onSuccess: () => {
      utils.review.listByStore.invalidate();
      utils.review.getStats.invalidate();

      toast({
        title: 'Réponse publiée',
        description: 'Votre réponse a été publiée sur Google Reviews avec succès.',
      });

      // Réinitialiser le formulaire
      setIsModalOpen(false);
      setSelectedReview(null);
      setResponseContent('');
      setAiSuggestion(null);
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error',
      });
    },
  });

  // Mutation: Générer suggestion IA
  const generateAiMutation = api.review.generateAiResponse.useMutation({
    onSuccess: (data) => {
      setAiSuggestion(data);
      toast({
        title: '✨ Suggestion IA générée',
        description: `Confiance: ${Math.round(data.confidence * 100)}% · Modèle: ${data.model}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur IA',
        description: error.message,
        variant: 'error',
      });
    },
  });

  /**
   * Ouvre le modal de réponse pour un avis
   */
  const openResponseModal = (review: ReviewDTO) => {
    setSelectedReview(review);
    setIsModalOpen(true);
    setResponseContent('');
    setAiSuggestion(null);

    // Déterminer le ton automatiquement selon le rating
    if (review.rating <= 2) {
      setSelectedTone('apologetic');
    } else if (review.rating >= 4) {
      setSelectedTone('friendly');
    } else {
      setSelectedTone('professional');
    }
  };

  /**
   * Ferme le modal
   */
  const closeResponseModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
    setResponseContent('');
    setAiSuggestion(null);
  };

  /**
   * Génère une suggestion IA
   */
  const generateAiSuggestion = () => {
    if (!selectedReview) return;

    generateAiMutation.mutate({
      reviewId: selectedReview.reviewId,
      tone: selectedTone,
      language: 'fr',
      includeEmojis: true,
    });
  };

  /**
   * Utilise la suggestion IA (copie dans le textarea)
   */
  const useAiSuggestion = () => {
    if (aiSuggestion) {
      setResponseContent(aiSuggestion.suggestedResponse);
      toast({
        title: 'Suggestion appliquée',
        description: "Vous pouvez modifier la réponse avant de l'envoyer.",
      });
    }
  };

  /**
   * Soumet la réponse
   */
  const submitResponse = () => {
    if (!selectedReview) return;

    if (responseContent.trim().length < 10) {
      toast({
        title: 'Réponse trop courte',
        description: 'Votre réponse doit contenir au moins 10 caractères.',
        variant: 'error',
      });
      return;
    }

    respondMutation.mutate({
      reviewId: selectedReview.reviewId,
      responseContent: responseContent.trim(),
    });
  };

  return {
    // State
    isModalOpen,
    selectedReview,
    responseContent,
    aiSuggestion,
    selectedTone,

    // Setters
    setResponseContent,
    setSelectedTone,

    // Actions
    openResponseModal,
    closeResponseModal,
    generateAiSuggestion,
    useAiSuggestion,
    submitResponse,

    // Loading states
    isSubmitting: respondMutation.isPending,
    isGeneratingAi: generateAiMutation.isPending,
  };
}
