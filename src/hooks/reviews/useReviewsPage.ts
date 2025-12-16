/**
 * Hook principal pour la page Reviews
 * Centralise la logique métier
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';

export function useReviewsPage() {
  const { toast } = useToast();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Récupérer la liste des stores
  const { data: stores, isLoading: storesLoading } = api.store.list.useQuery();

  // Sélectionner automatiquement le premier store si disponible
  useEffect(() => {
    if (stores && stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0]?.id ?? null);
    }
  }, [stores, selectedStoreId]);

  // Trouver le store sélectionné pour vérifier l'API key
  const selectedStore = stores?.find((s) => s.id === selectedStoreId);

  // Vérifier que le commerce a un Place ID ET une API Key configurée
  const hasApiKey =
    selectedStore?.googlePlaceId &&
    selectedStore.googlePlaceId.trim().length > 0 &&
    selectedStore?.googleApiKeyStatus === 'configured';

  // Compter les commerces sans API configurée
  const storesWithoutApi =
    stores?.filter(
      (s) =>
        !s.googlePlaceId || s.googlePlaceId.length === 0 || s.googleApiKeyStatus !== 'configured',
    ) || [];

  const isSingleStoreWithoutApi = stores && stores.length === 1 && storesWithoutApi.length === 1;

  return {
    selectedStoreId,
    setSelectedStoreId,
    stores,
    storesLoading,
    selectedStore,
    hasApiKey,
    isSingleStoreWithoutApi,
    toast,
  };
}
