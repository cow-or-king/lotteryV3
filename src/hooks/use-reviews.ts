/**
 * useReviews Hook
 * Hook pour gérer les avis Google via tRPC
 * IMPORTANT: ZERO any types, Type-safety complète
 */

'use client';

import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook pour lister les avis d'un commerce
 */
export const useReviewsByStore = (
  storeId: string,
  filters?: {
    campaignId?: string;
    rating?: number;
    hasResponse?: boolean;
    isVerified?: boolean;
    status?: 'PENDING' | 'PROCESSED' | 'ARCHIVED';
    fromDate?: Date;
    toDate?: Date;
  },
  limit = 20,
  offset = 0,
) => {
  const query = api.review.listByStore.useQuery({
    storeId,
    filters,
    limit,
    offset,
  });

  return {
    reviews: query.data?.reviews ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook pour récupérer les statistiques des avis d'un commerce
 */
export const useReviewStats = (
  storeId: string,
  filters?: {
    campaignId?: string;
    rating?: number;
    hasResponse?: boolean;
    isVerified?: boolean;
    status?: 'PENDING' | 'PROCESSED' | 'ARCHIVED';
    fromDate?: Date;
    toDate?: Date;
  },
) => {
  const query = api.review.getStats.useQuery({
    storeId,
    filters,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook pour récupérer un avis par son ID
 */
export const useReviewById = (reviewId: string) => {
  const query = api.review.getById.useQuery({ reviewId });

  return {
    review: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook pour synchroniser les avis depuis Google My Business
 */
export const useSyncReviews = () => {
  const { toast } = useToast();
  const utils = api.useUtils();

  const mutation = api.review.sync.useMutation({
    onSuccess: (data) => {
      toast.success(
        'Synchronisation réussie',
        `${data.totalFetched} avis récupérés, ${data.synchronized} synchronisés`,
      );
      // Invalider les queries pour rafraîchir les données
      utils.review.listByStore.invalidate();
      utils.review.getStats.invalidate();
    },
    onError: (error) => {
      toast.error('Erreur de synchronisation', error.message);
    },
  });

  return {
    syncReviews: (storeId: string) => mutation.mutate({ storeId }),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};

/**
 * Hook pour répondre à un avis
 */
export const useRespondToReview = () => {
  const { toast } = useToast();
  const utils = api.useUtils();

  const mutation = api.review.respond.useMutation({
    onSuccess: () => {
      toast.success('Réponse publiée', 'Votre réponse a été publiée avec succès');
      // Invalider les queries pour rafraîchir les données
      utils.review.listByStore.invalidate();
      utils.review.getById.invalidate();
      utils.review.getStats.invalidate();
    },
    onError: (error) => {
      if (error.message.includes('API key') || error.message.includes('credentials')) {
        toast.error(
          'Configuration requise',
          'Veuillez configurer votre API key Google dans les paramètres du commerce',
        );
      } else if (error.message.includes('already responded')) {
        toast.warning('Déjà répondu', 'Vous avez déjà répondu à cet avis');
      } else {
        toast.error('Erreur', error.message);
      }
    },
  });

  return {
    respondToReview: (reviewId: string, responseContent: string, templateId?: string) =>
      mutation.mutate({ reviewId, responseContent, templateId }),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
};

/**
 * Hook pour vérifier si un participant a laissé un avis
 * Utilisé pour l'éligibilité à la loterie
 */
export const useVerifyParticipant = (email: string, storeId: string, enabled = true) => {
  const query = api.review.verifyParticipant.useQuery(
    { email, storeId },
    { enabled }, // Only run if enabled
  );

  return {
    participant: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
