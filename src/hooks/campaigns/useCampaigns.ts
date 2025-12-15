/**
 * Campaign Hooks
 * Hooks React pour gérer les campagnes via tRPC
 * IMPORTANT: ZERO any types
 */

import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook pour suggérer un type de jeu basé sur le nombre de lots
 */
export function useGameSuggestion() {
  const { toast } = useToast();

  const mutation = api.campaign.suggestGame.useMutation({
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error',
      });
    },
  });

  return {
    suggestGame: mutation.mutateAsync,
    isLoading: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
  };
}

/**
 * Hook pour créer une campagne
 */
export function useCreateCampaign() {
  const { toast } = useToast();
  const utils = api.useUtils();

  const mutation = api.campaign.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Succès',
        description: data.message,
        variant: 'success',
      });

      // Invalider les queries pour rafraîchir les données
      utils.campaign.listByStore.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error',
      });
    },
  });

  return {
    createCampaign: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook pour récupérer une campagne par ID
 */
export function useCampaign(id: string) {
  return api.campaign.getById.useQuery(
    { id },
    {
      enabled: !!id,
    },
  );
}

/**
 * Hook pour lister les campagnes d'un commerce
 */
export function useCampaignsByStore(storeId: string) {
  return api.campaign.listByStore.useQuery(
    { storeId },
    {
      enabled: !!storeId,
    },
  );
}

/**
 * Hook pour lister toutes les campagnes de l'utilisateur
 */
export function useAllCampaigns() {
  return api.campaign.listAll.useQuery();
}

/**
 * Hook pour activer/désactiver une campagne
 */
export function useToggleCampaignStatus() {
  const { toast } = useToast();
  const utils = api.useUtils();

  const mutation = api.campaign.toggleStatus.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Statut de la campagne mis à jour',
        variant: 'success',
      });

      // Invalider les queries pour rafraîchir les données
      utils.campaign.listByStore.invalidate();
      utils.campaign.getById.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error',
      });
    },
  });

  return {
    toggleStatus: mutation.mutateAsync,
    isToggling: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook pour supprimer une campagne
 */
export function useDeleteCampaign() {
  const { toast } = useToast();
  const utils = api.useUtils();

  const mutation = api.campaign.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Campagne supprimée avec succès',
        variant: 'success',
      });

      // Invalider les queries pour rafraîchir les données
      utils.campaign.listByStore.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error',
      });
    },
  });

  return {
    deleteCampaign: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}
