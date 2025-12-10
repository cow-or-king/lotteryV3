/**
 * Hook pour récupérer le statut du service IA
 * Permet d'afficher des badges et messages selon la disponibilité
 * IMPORTANT: ZERO any types
 */

'use client';

import { api } from '@/lib/trpc/client';

export interface AIServiceStatus {
  isAvailable: boolean;
  provider: string | null;
  isLoading: boolean;
}

export function useAIServiceStatus(): AIServiceStatus {
  const { data, isLoading } = api.review.getAiServiceStatus.useQuery(undefined, {
    // Cache pendant 5 minutes
    staleTime: 5 * 60 * 1000,
    // Refetch toutes les 10 minutes
    refetchInterval: 10 * 60 * 1000,
  });

  return {
    isAvailable: data?.isAvailable ?? false,
    provider: data?.provider ?? null,
    isLoading,
  };
}
