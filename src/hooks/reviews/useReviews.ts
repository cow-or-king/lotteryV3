/**
 * Hook pour la gestion des reviews
 * Queries tRPC, mutations, filtres et pagination
 */

'use client';

import { api } from '@/lib/trpc/client';

interface UseReviewsParams {
  storeId: string | null;
}

export function useReviews({ storeId }: UseReviewsParams) {
  const utils = api.useUtils();

  // Query pour les statistiques
  const { data: stats, isLoading: statsLoading } = api.review.getStats.useQuery(
    { storeId: storeId ?? '' },
    { enabled: !!storeId },
  );

  // Query pour la liste des reviews
  const { data: reviewsData, isLoading: reviewsLoading } = api.review.listByStore.useQuery(
    { storeId: storeId ?? '', limit: 20, offset: 0 },
    { enabled: !!storeId },
  );

  // Mutation pour synchroniser les reviews
  const syncMutation = api.review.sync.useMutation({
    onSuccess: () => {
      // Invalider les queries pour rafraîchir les données
      utils.review.getStats.invalidate();
      utils.review.listByStore.invalidate();
    },
  });

  return {
    stats,
    statsLoading,
    reviewsData,
    reviewsLoading,
    syncMutation,
  };
}
