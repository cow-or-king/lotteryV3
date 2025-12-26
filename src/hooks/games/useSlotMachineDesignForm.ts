/**
 * Hook pour gérer le formulaire de design de machine à sous
 * Centralise toute la logique de state et mutations
 * IMPORTANT: ZERO any types
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';
import {
  SlotMachineDesignConfig,
  getDefaultSlotMachineDesign,
  SlotSymbol,
  SlotWinPattern,
} from '@/lib/types/game';

export function useSlotMachineDesignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('id');
  const utils = api.useUtils();

  // State
  const [design, setDesign] = useState<SlotMachineDesignConfig>(getDefaultSlotMachineDesign());
  const [designName, setDesignName] = useState('Ma machine à sous');

  // Charger le jeu existant
  const { data: existingGame, isLoading } = api.game.getById.useQuery(
    { id: gameId || '' },
    {
      enabled: !!gameId,
    },
  );

  useEffect(() => {
    if (existingGame && existingGame.type === 'SLOT_MACHINE') {
      // Parser la config depuis JSON
      // Type assertion to access config property safely
      const gameWithConfig = existingGame as { config: unknown };
      const config = gameWithConfig.config;
      const parsedConfig: unknown = typeof config === 'string' ? JSON.parse(config) : config;

      setDesign(parsedConfig as SlotMachineDesignConfig);
      setDesignName(existingGame.name);
    }
  }, [existingGame]);

  // Mutations
  type MutationOptions = {
    onSuccess: () => void;
    onError: (error: unknown) => void;
  };

  const createGameOptions: MutationOptions = {
    onSuccess: () => {
      void utils.game.list.invalidate();
      toast.success('Machine à sous créée avec succès');
      router.push('/dashboard/games');
    },
    onError: (_error) => {
      toast.error('Erreur lors de la création de la machine à sous');
    },
  };

  const createGame = api.game.saveSlotMachineDesign.useMutation(createGameOptions);

  const updateGameOptions: MutationOptions = {
    onSuccess: () => {
      void utils.game.list.invalidate();
      void utils.game.getById.invalidate();
      toast.success('Machine à sous mise à jour avec succès');
      router.push('/dashboard/games');
    },
    onError: (_error) => {
      toast.error('Erreur lors de la mise à jour de la machine à sous');
    },
  };

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

  const handleSymbolChange = (index: number, updates: Partial<SlotSymbol>) => {
    const newSymbols = [...design.symbols];
    const symbol = newSymbols[index];
    if (symbol) {
      newSymbols[index] = { ...symbol, ...updates };
      setDesign({ ...design, symbols: newSymbols });
    }
  };

  const handleAddPattern = (pattern: Omit<SlotWinPattern, 'id'>) => {
    const newPattern: SlotWinPattern = {
      ...pattern,
      id: `pattern-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    setDesign({ ...design, winPatterns: [...design.winPatterns, newPattern] });
  };

  const handleUpdatePattern = (id: string, updates: Partial<SlotWinPattern>) => {
    const newPatterns = design.winPatterns.map((pattern) =>
      pattern.id === id ? { ...pattern, ...updates } : pattern,
    );
    setDesign({ ...design, winPatterns: newPatterns });
  };

  const handleDeletePattern = (id: string) => {
    const newPatterns = design.winPatterns.filter((pattern) => pattern.id !== id);
    setDesign({ ...design, winPatterns: newPatterns });
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
    handleSymbolChange,
    handleAddPattern,
    handleUpdatePattern,
    handleDeletePattern,
  };
}
