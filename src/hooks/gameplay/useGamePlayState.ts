/**
 * Hook pour gérer l'état du gameplay
 */

import { useState, useEffect } from 'react';
import { api } from '@/lib/trpc/client';

type GameState = 'idle' | 'playing' | 'result';

interface GameResult {
  hasWon: boolean;
  prize: {
    id: string;
    name: string;
    description: string | null;
    value: number | null;
    color: string;
  } | null;
  claimCode: string | null;
  winningSegmentId: string | null;
  winningCombination?: [string, string, string] | null;
}

interface MockUser {
  name: string;
  email: string;
}

export function useGamePlayState(campaignId: string) {
  const [mockUser, setMockUser] = useState<MockUser | null>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [result, setResult] = useState<GameResult | null>(null);

  // Récupérer la campagne avec l'API publique
  const { data: campaign, isLoading } = api.game.getCampaignPublic.useQuery(
    { id: campaignId },
    { enabled: !!campaignId },
  );

  // Vérifier l'utilisateur mockup au chargement
  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setMockUser(JSON.parse(storedUser));
    }
  }, []);

  return {
    mockUser,
    gameState,
    setGameState,
    result,
    setResult,
    campaign,
    isLoading,
  };
}
