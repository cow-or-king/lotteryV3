/**
 * Hook for game action handlers
 */
import { useState } from 'react';
import type { GameResult } from '@/types/game.types';
import type { GameStep } from '@/hooks/game/useGameState';
import type { useGameMutations } from './useGameMutations';

interface UseGameHandlersParams {
  campaignId: string;
  gameUser: { email: string; name: string } | null;
  playMutation: ReturnType<typeof useGameMutations>['playMutation'];
  completeConditionMutation: ReturnType<typeof useGameMutations>['completeConditionMutation'];
  completeGameConditionMutation: ReturnType<
    typeof useGameMutations
  >['completeGameConditionMutation'];
  conditionsProgress: unknown;
  setCurrentStep: (step: GameStep) => void;
  setGameResult: (result: GameResult | null) => void;
}

export function useGameHandlers({
  campaignId,
  gameUser,
  playMutation,
  completeConditionMutation,
  completeGameConditionMutation,
  conditionsProgress,
  setCurrentStep,
  setGameResult: _setGameResult,
}: UseGameHandlersParams) {
  const [isCompletingCondition, setIsCompletingCondition] = useState(false);

  const handlePlay = async () => {
    if (!gameUser?.email) {
      return;
    }

    setCurrentStep('playing');

    try {
      await playMutation.mutateAsync({
        campaignId,
        playerEmail: gameUser.email,
        playerName: gameUser.name || 'Joueur',
      });
    } catch (_error) {
      // Error handled by mutation
    }
  };

  const handleSpinComplete = async () => {
    setCurrentStep('result');

    if (gameUser?.email) {
      try {
        await completeGameConditionMutation.mutateAsync({
          campaignId,
          participantEmail: gameUser.email,
        });
      } catch (_error) {
        // Error handled by mutation
      }
    }

    setTimeout(() => {
      setCurrentStep('journey-complete');
    }, 3000);
  };

  const handleConditionComplete = async () => {
    const progress = conditionsProgress as { currentCondition?: { id: string } } | null | undefined;

    if (!progress?.currentCondition || !gameUser?.email) {
      return;
    }

    try {
      setIsCompletingCondition(true);

      const result = await completeConditionMutation.mutateAsync({
        campaignId,
        participantEmail: gameUser.email,
        conditionId: progress.currentCondition.id,
      });

      if (result.canPlay && result.enablesGame) {
        setCurrentStep('playing');
        await handlePlay();
      } else {
        setCurrentStep('journey-complete');
      }
      setIsCompletingCondition(false);
    } catch (_error) {
      setIsCompletingCondition(false);
    }
  };

  return {
    handlePlay,
    handleSpinComplete,
    handleConditionComplete,
    isCompletingCondition,
  };
}
