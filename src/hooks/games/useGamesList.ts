/**
 * Hook for managing games list data
 * Handles fetching custom designs and games from the database
 */

import { api } from '@/lib/trpc/client';

type Game = {
  id: string;
  type: string;
  name: string;
  _count?: {
    plays: number;
  };
};

type WheelDesign = {
  id: string;
  name: string;
  numberOfSegments: number;
  colorMode: string;
};

export function useGamesList() {
  const wheelDesignsQuery = api.wheelDesign.list.useQuery();
  // Type assertion to avoid deep type instantiation issues
  const customDesigns = (wheelDesignsQuery.data ?? []) as WheelDesign[];
  const isLoadingDesigns = wheelDesignsQuery.isLoading;

  const gamesQuery = api.game.list.useQuery();
  const customGames = (gamesQuery.data ?? []) as Game[];

  const slotMachineGames = customGames.filter((game) => game.type === 'SLOT_MACHINE');
  const wheelMiniGames = customGames.filter((game) => game.type === 'WHEEL_MINI');

  const hasCustomContent = customDesigns.length > 0 || customGames.length > 0;
  const isLoading = isLoadingDesigns || gamesQuery.isLoading;

  return {
    customDesigns,
    customGames,
    slotMachineGames,
    wheelMiniGames,
    hasCustomContent,
    isLoading,
  };
}
