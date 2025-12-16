/**
 * Campaign Hooks
 * Hooks React pour gérer les campagnes via tRPC
 * IMPORTANT: ZERO any types
 */

import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook pour suggérer un type de jeu basé sur le nombre de lots
 * Note: Cette fonction n'est plus utilisée car suggestGameTemplate est maintenant une query
 */
export function useGameSuggestion() {
  const { toast } = useToast();

  // suggestGameTemplate est maintenant une query, pas une mutation
  // Cette fonction est conservée pour compatibilité mais ne devrait plus être utilisée
  return {
    suggestGame: async () => {
      toast({
        title: 'Erreur',
        description: 'Cette méthode est obsolète',
        variant: 'error',
      });
      throw new Error('suggestGame is deprecated');
    },
    isLoading: false,
    data: undefined,
    error: null,
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
      utils.campaign.listAll.invalidate(); // Rafraîchir la liste complète aussi
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
