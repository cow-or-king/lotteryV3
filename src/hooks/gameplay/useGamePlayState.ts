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

  // Récupérer l'utilisateur depuis le cookie de jeu
  useEffect(() => {
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    const userCookie = getCookie('rl-game-user');
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie));
        setMockUser({
          name: userData.name || 'Joueur',
          email: userData.email || '',
        });
      } catch (error) {
        console.error('Error parsing user cookie:', error);
      }
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
