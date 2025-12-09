/**
 * Hook useReviewResponse
 * Gestion des réponses aux avis Google avec suggestions IA
 * IMPORTANT: ZERO any types, architecture modulaire
 */

'use client';

import { useState, useRef } from 'react';
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
  const [responseStars, setResponseStarsState] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [selectedTone, setSelectedTone] = useState<'professional' | 'friendly' | 'apologetic'>(
    'friendly',
  );
  const scrollPositionRef = useRef<number>(0);

  const utils = api.useUtils();

  // Vérifier si le service IA est disponible
  const { data: aiServiceStatus } = api.review.getAiServiceStatus.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const aiServiceAvailable = aiServiceStatus?.isAvailable ?? false;

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
   * Met à jour le nombre d'étoiles dans la réponse
   * Affiche toujours 5 étoiles : jaunes (⭐) pour les sélectionnées, grises (☆) pour les autres
   */
  const setResponseStars = (stars: number) => {
    setResponseStarsState(stars);

    // Supprimer les anciennes étoiles du début du contenu (support des deux formats)
    const contentWithoutStars = responseContent.replace(/^[⭐☆]+\n+/, '');

    // Ajouter les nouvelles étoiles si stars > 0 ou stars === -1 (mode "5 grises")
    if (stars > 0) {
      // stars étoiles jaunes + (5 - stars) étoiles grises
      const yellowStars = '⭐'.repeat(stars);
      const grayStars = '☆'.repeat(5 - stars);
      const starsText = yellowStars + grayStars + '\n\n';
      setResponseContent(starsText + contentWithoutStars);
    } else if (stars === -1) {
      // Mode "5 étoiles grises" (checkbox)
      const starsText = '☆☆☆☆☆\n\n';
      setResponseContent(starsText + contentWithoutStars);
    } else {
      // stars === 0 : rien
      setResponseContent(contentWithoutStars);
    }
  };

  /**
   * Ouvre le modal de réponse pour un avis
   */
  const openResponseModal = (review: ReviewDTO) => {
    // Sauvegarder la position de scroll actuelle
    scrollPositionRef.current = window.scrollY;

    setSelectedReview(review);
    setIsModalOpen(true);
    setResponseContent('');
    setResponseStarsState(0);
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
    setResponseStarsState(0);
    setAiSuggestion(null);

    // Restaurer la position de scroll
    setTimeout(() => {
      window.scrollTo({ top: scrollPositionRef.current, behavior: 'smooth' });
    }, 100);
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
      // Conserver les étoiles si déjà sélectionnées
      if (responseStars > 0) {
        const starsText = '⭐'.repeat(responseStars) + '\n\n';
        setResponseContent(starsText + aiSuggestion.suggestedResponse);
      } else {
        setResponseContent(aiSuggestion.suggestedResponse);
      }
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
    responseStars,
    aiSuggestion,
    selectedTone,
    aiServiceAvailable,

    // Setters
    setResponseContent,
    setResponseStars,
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
