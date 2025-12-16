/**
 * Hook pour gérer les actions du gameplay
 */

import { toast } from 'sonner';
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

interface UseGamePlayHandlersProps {
  campaignId: string;
  mockUser: MockUser | null;
  setGameState: (state: GameState) => void;
  setResult: (result: GameResult) => void;
}

export function useGamePlayHandlers({
  campaignId,
  mockUser,
  setGameState,
  setResult,
}: UseGamePlayHandlersProps) {
  const playMutation = api.game.play.useMutation();

  const handlePlay = async () => {
    if (!mockUser || !campaignId) {
      return;
    }

    // Vérifier que mockUser existe
    if (!mockUser) {
      toast.error('Erreur: utilisateur non connecté');
      return;
    }

    // Appeler l'API AVANT de faire tourner la roue
    try {
      const playResult = await playMutation.mutateAsync({
        campaignId,
        playerEmail: mockUser.email,
        playerName: mockUser.name,
      });

      // Sauvegarder le résultat pour l'afficher après l'animation
      setResult(playResult);

      // Maintenant on peut passer à l'état "playing" pour afficher la roue
      setGameState('playing');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const handleSpinComplete = () => {
    // L'animation de la roue est terminée, on affiche le résultat
    setGameState('result');
  };

  return {
    handlePlay,
    handleSpinComplete,
  };
}
