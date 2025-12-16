/**
 * Hook for managing game actions
 * Handles delete, duplicate, and other game mutations
 */

import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/hooks/ui/useConfirm';

export function useGameActions() {
  const utils = api.useUtils();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const deleteWheelDesign = api.wheelDesign.delete.useMutation({
    onSuccess: () => {
      void utils.wheelDesign.list.invalidate();
      toast({
        title: 'Design supprimé',
        description: 'Le design de roue a été supprimé avec succès.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le design.',
        variant: 'error',
      });
    },
  });

  const deleteGame = api.game.delete.useMutation({
    onSuccess: () => {
      void utils.game.list.invalidate();
      toast({
        title: 'Jeu supprimé',
        description: 'Le jeu a été supprimé avec succès.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le jeu.',
        variant: 'error',
      });
    },
  });

  const handleDeleteWheel = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const confirmed = await confirm({
      title: 'Supprimer le design ?',
      message:
        'Êtes-vous sûr de vouloir supprimer ce design de roue ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'danger',
    });

    if (confirmed) {
      deleteWheelDesign.mutate(id);
    }
  };

  const handleDeleteGame = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const confirmed = await confirm({
      title: 'Supprimer le jeu ?',
      message: 'Êtes-vous sûr de vouloir supprimer ce jeu ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'danger',
    });

    if (confirmed) {
      deleteGame.mutate({ id });
    }
  };

  return {
    handleDeleteWheel,
    handleDeleteGame,
    isDeleting: deleteWheelDesign.isPending || deleteGame.isPending,
  };
}
