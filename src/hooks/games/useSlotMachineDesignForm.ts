/**
 * Hook pour gérer le formulaire de design de machine à sous
 * Centralise toute la logique de state et mutations
 * IMPORTANT: ZERO any types
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';
import {
  SlotMachineDesignConfig,
  getDefaultSlotMachineDesign,
  SlotSymbol,
  SlotWinPattern,
} from '@/lib/types/game-design.types';

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
      const parsedConfig =
        typeof existingGame.config === 'string'
          ? JSON.parse(existingGame.config)
          : existingGame.config;

      setDesign(parsedConfig as SlotMachineDesignConfig);
      setDesignName(existingGame.name);
    }
  }, [existingGame]);

  // Mutations
  // @ts-expect-error - Known tRPC issue: "Type instantiation is excessively deep" with complex nested schemas
  // This is a limitation of TypeScript's type inference with deeply nested Zod schemas in tRPC
  // The runtime behavior is correct, only the type inference fails
  const createGame = api.game.saveSlotMachineDesign.useMutation({
    onSuccess: () => {
      utils.game.list.invalidate();
      toast.success('Machine à sous créée avec succès');
      router.push('/dashboard/games');
    },
    onError: (error) => {
      console.error('Error creating slot machine:', error);
      toast.error('Erreur lors de la création de la machine à sous');
    },
  });

  const updateGame = api.game.update.useMutation({
    onSuccess: () => {
      utils.game.list.invalidate();
      utils.game.getById.invalidate();
      toast.success('Machine à sous mise à jour avec succès');
      router.push('/dashboard/games');
    },
    onError: (error) => {
      console.error('Error updating slot machine:', error);
      toast.error('Erreur lors de la mise à jour de la machine à sous');
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
