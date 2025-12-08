/**
 * useResponseTemplates Hook
 * Hook pour gérer les templates de réponse via tRPC
 * IMPORTANT: ZERO any types, Type-safety complète
 */

'use client';

import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';

export type TemplateCategory = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

/**
 * Hook pour lister les templates d'un commerce
 */
export const useResponseTemplatesByStore = (
  storeId: string,
  category?: TemplateCategory,
  popularOnly = false,
) => {
  const query = api.responseTemplate.listByStore.useQuery({
    storeId,
    category,
    popularOnly,
  });

  return {
    templates: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook pour créer un template de réponse
 */
export const useCreateResponseTemplate = () => {
  const { toast } = useToast();
  const utils = api.useUtils();

  const mutation = api.responseTemplate.create.useMutation({
    onSuccess: () => {
      toast.success('Template créé', 'Le template a été créé avec succès');
      // Invalider les queries pour rafraîchir les données
      utils.responseTemplate.listByStore.invalidate();
    },
    onError: (error) => {
      toast.error('Erreur de création', error.message);
    },
  });

  return {
    createTemplate: (data: {
      storeId: string;
      name: string;
      content: string;
      category: TemplateCategory;
    }) => mutation.mutate(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
};

/**
 * Hook pour mettre à jour un template de réponse
 */
export const useUpdateResponseTemplate = () => {
  const { toast } = useToast();
  const utils = api.useUtils();

  const mutation = api.responseTemplate.update.useMutation({
    onSuccess: () => {
      toast.success('Template modifié', 'Le template a été modifié avec succès');
      // Invalider les queries pour rafraîchir les données
      utils.responseTemplate.listByStore.invalidate();
    },
    onError: (error) => {
      toast.error('Erreur de modification', error.message);
    },
  });

  return {
    updateTemplate: (data: {
      templateId: string;
      name?: string;
      content?: string;
      category?: TemplateCategory;
    }) => mutation.mutate(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
};

/**
 * Hook pour supprimer un template de réponse
 */
export const useDeleteResponseTemplate = () => {
  const { toast } = useToast();
  const utils = api.useUtils();

  const mutation = api.responseTemplate.delete.useMutation({
    onSuccess: () => {
      toast.success('Template supprimé', 'Le template a été supprimé avec succès');
      // Invalider les queries pour rafraîchir les données
      utils.responseTemplate.listByStore.invalidate();
    },
    onError: (error) => {
      toast.error('Erreur de suppression', error.message);
    },
  });

  return {
    deleteTemplate: (templateId: string) => mutation.mutate({ templateId }),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
};

/**
 * Hook pour incrémenter l'utilisation d'un template
 * Appelé automatiquement quand un template est utilisé pour répondre
 */
export const useIncrementTemplateUsage = () => {
  const utils = api.useUtils();

  const mutation = api.responseTemplate.incrementUsage.useMutation({
    onSuccess: () => {
      // Invalider les queries pour rafraîchir les stats
      utils.responseTemplate.listByStore.invalidate();
    },
    // Pas de toast pour cette action (silencieuse)
  });

  return {
    incrementUsage: (templateId: string) => mutation.mutate({ templateId }),
    isLoading: mutation.isPending,
  };
};

/**
 * Hook combiné pour gérer tous les templates d'un commerce
 * Inclut la liste et les actions CRUD
 */
export const useResponseTemplatesManager = (
  storeId: string,
  category?: TemplateCategory,
  popularOnly = false,
) => {
  const list = useResponseTemplatesByStore(storeId, category, popularOnly);
  const create = useCreateResponseTemplate();
  const update = useUpdateResponseTemplate();
  const deleteTemplate = useDeleteResponseTemplate();
  const incrementUsage = useIncrementTemplateUsage();

  return {
    // Liste
    templates: list.templates,
    isLoading: list.isLoading,
    isError: list.isError,
    error: list.error,
    refetch: list.refetch,

    // Actions
    createTemplate: create.createTemplate,
    isCreating: create.isLoading,
    createSuccess: create.isSuccess,
    createError: create.error,
    resetCreate: create.reset,

    updateTemplate: update.updateTemplate,
    isUpdating: update.isLoading,
    updateSuccess: update.isSuccess,
    updateError: update.error,
    resetUpdate: update.reset,

    deleteTemplate: deleteTemplate.deleteTemplate,
    isDeleting: deleteTemplate.isLoading,
    deleteSuccess: deleteTemplate.isSuccess,
    deleteError: deleteTemplate.error,
    resetDelete: deleteTemplate.reset,

    incrementUsage: incrementUsage.incrementUsage,
  };
};
