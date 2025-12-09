/**
 * useStoreMutations Hook
 * Mutations tRPC pour les stores
 * IMPORTANT: ZERO any types
 */

'use client';

import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';

interface UseStoreMutationsProps {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useStoreMutations({
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}: UseStoreMutationsProps = {}) {
  const { toast } = useToast();
  const utils = api.useUtils();

  const createStore = api.store.create.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      onCreateSuccess?.();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const deleteStore = api.store.delete.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      onDeleteSuccess?.();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const updateStore = api.store.update.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      onUpdateSuccess?.();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  return {
    createStore,
    deleteStore,
    updateStore,
  };
}
