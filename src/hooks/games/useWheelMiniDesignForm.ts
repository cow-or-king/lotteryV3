/**
 * Hook pour gérer le formulaire de design de roue mini
 * Centralise toute la logique de state et mutations
 * IMPORTANT: ZERO any types
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { WheelMiniDesignConfig, getDefaultWheelMiniDesign } from '@/lib/types/game-design.types';

export function useWheelMiniDesignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('id');
  const utils = api.useUtils();

  // State
  const [design, setDesign] = useState<WheelMiniDesignConfig>(getDefaultWheelMiniDesign());
  const [designName, setDesignName] = useState('Ma roue rapide');

  // Charger le jeu existant
  const { data: existingGame, isLoading } = api.game.getById.useQuery(
    { id: gameId || '' },
    {
      enabled: !!gameId,
    },
  );

  useEffect(() => {
    if (existingGame && existingGame.type === 'WHEEL_MINI') {
      // Parser la config depuis JSON
      const parsedConfig =
        typeof existingGame.config === 'string'
          ? JSON.parse(existingGame.config)
          : existingGame.config;

      setDesign(parsedConfig as WheelMiniDesignConfig);
      setDesignName(existingGame.name);
    }
  }, [existingGame]);

  // Mutations
  const createGame = api.game.saveWheelMiniDesign.useMutation({
    onSuccess: () => {
      utils.game.list.invalidate();
      toast.success('Roue rapide créée avec succès');
      router.push('/dashboard/games');
    },
    onError: (error) => {
      console.error('Error creating wheel mini:', error);
      toast.error('Erreur lors de la création de la roue rapide');
    },
  });

  const updateGame = api.game.update.useMutation({
    onSuccess: () => {
      utils.game.list.invalidate();
      utils.game.getById.invalidate();
      toast.success('Roue rapide mise à jour avec succès');
      router.push('/dashboard/games');
    },
    onError: (error) => {
      console.error('Error updating wheel mini:', error);
      toast.error('Erreur lors de la mise à jour de la roue rapide');
    },
  });

  // Handlers
  const handleSaveDesign = () => {
    if (gameId) {
      // Update existing game
      updateGame.mutate({
        id: gameId,
        name: designName,
        config: design as unknown as Record<string, unknown>,
      });
    } else {
      // Create new game
      createGame.mutate({
        name: designName,
        design: design,
      });
    }
  };

  return {
    // State
    design,
    setDesign,
    designName,
    setDesignName,
    gameId,
    isLoading,
    isSaving: createGame.isPending || updateGame.isPending,

    // Handlers
    handleSaveDesign,
  };
}
