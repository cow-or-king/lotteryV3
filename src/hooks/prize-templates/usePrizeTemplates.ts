/**
 * Prize Template Hooks
 * Hooks React pour gérer les modèles de lots via tRPC
 * IMPORTANT: ZERO any types
 */

import { api } from '@/lib/trpc/client';

/**
 * Hook pour récupérer tous les modèles de lots
 */
export function usePrizeTemplates() {
  const { data, isLoading, error } = api.prizeTemplate.list.useQuery();

  return {
    allPrizeTemplates: data,
    isLoading,
    error,
  };
}
