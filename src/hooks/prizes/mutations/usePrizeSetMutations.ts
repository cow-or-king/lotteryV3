/**
 * usePrizeSetMutations Hook
 * Mutations tRPC pour les prize sets
 * IMPORTANT: ZERO any types
 */

'use client';

import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import type { SetFormData, SelectedItem } from '@/lib/types/prize-set.types';

interface UsePrizeSetMutationsProps {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function usePrizeSetMutations({
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}: UsePrizeSetMutationsProps = {}) {
  const { toast } = useToast();
  const utils = api.useUtils();

  const addItemToSet = api.prizeSet.addItem.useMutation({
    onSuccess: () => {
      utils.prizeSet.list.invalidate();
    },
  });

  const removeItemFromSet = api.prizeSet.removeItem.useMutation({
    onSuccess: () => {
      utils.prizeSet.list.invalidate();
    },
  });

  const createSet = api.prizeSet.create.useMutation({
    onSuccess: async (data, variables, context) => {
      utils.prizeSet.list.invalidate();
      onCreateSuccess?.();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const updateSet = api.prizeSet.update.useMutation({
    onSuccess: async () => {
      utils.prizeSet.list.invalidate();
      onUpdateSuccess?.();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const deleteSet = api.prizeSet.delete.useMutation({
    onSuccess: () => {
      utils.prizeSet.list.invalidate();
      onDeleteSuccess?.();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const createSetWithItems = async (formData: SetFormData, selectedItems: SelectedItem[]) => {
    try {
      const set = await createSet.mutateAsync(formData);

      if (selectedItems.length > 0) {
        for (const item of selectedItems) {
          await addItemToSet.mutateAsync({
            prizeSetId: set.id,
            prizeTemplateId: item.prizeTemplateId,
            probability: item.probability,
            quantity: item.quantity,
          });
        }
      }

      return { success: true, data: set };
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Erreur lors de l'ajout des gains au lot",
        variant: 'error',
      });
      return { success: false, error };
    }
  };

  const updateSetWithItems = async (
    setId: string,
    name: string,
    description: string,
    currentItems: SelectedItem[],
    newItems: SelectedItem[],
  ) => {
    try {
      await updateSet.mutateAsync({
        id: setId,
        name,
        description,
      });

      // Remove all current items
      for (const item of currentItems) {
        await removeItemFromSet.mutateAsync({
          prizeSetId: setId,
          prizeTemplateId: item.prizeTemplateId,
        });
      }

      // Add new items
      for (const item of newItems) {
        await addItemToSet.mutateAsync({
          prizeSetId: setId,
          prizeTemplateId: item.prizeTemplateId,
          probability: item.probability,
          quantity: item.quantity,
        });
      }

      return { success: true };
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour des gains du lot',
        variant: 'error',
      });
      return { success: false, error };
    }
  };

  return {
    createSet,
    updateSet,
    deleteSet,
    addItemToSet,
    removeItemFromSet,
    createSetWithItems,
    updateSetWithItems,
  };
}
