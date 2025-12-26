/**
 * Hook pour gérer le formulaire de design de roue mini
 * Centralise toute la logique de state et mutations
 * IMPORTANT: ZERO any types
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { WheelMiniDesignConfig, getDefaultWheelMiniDesign } from '@/lib/types/game';

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
      // Type assertion to avoid deep instantiation issues
      const gameWithConfig = existingGame as { config: unknown };
      const config = gameWithConfig.config;
      const parsedConfig: unknown = typeof config === 'string' ? JSON.parse(config) : config;

      setDesign(parsedConfig as WheelMiniDesignConfig);
      setDesignName(existingGame.name);
    }
  }, [existingGame]);

  // Mutations - Extract options to avoid type instantiation depth issues
  type MutationOptions = {
    onSuccess: () => void;
    onError: (error: unknown) => void;
  };

  const createGameOptions: MutationOptions = {
    onSuccess: () => {
      void utils.game.list.invalidate();
      toast.success('Roue rapide créée avec succès');
      router.push('/dashboard/games');
    },
    onError: (_error) => {
      toast.error('Erreur lors de la création de la roue rapide');
    },
  };

  const updateGameOptions: MutationOptions = {
    onSuccess: () => {
      void utils.game.list.invalidate();
      void utils.game.getById.invalidate();
      toast.success('Roue rapide mise à jour avec succès');
      router.push('/dashboard/games');
    },
    onError: (_error) => {
      toast.error('Erreur lors de la mise à jour de la roue rapide');
    },
  };

  const createGame = api.game.saveWheelMiniDesign.useMutation(createGameOptions);
  const updateGame = api.game.update.useMutation(updateGameOptions);

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
