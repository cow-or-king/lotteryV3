/**
 * Hook to manage all game-related mutations
 */
import { api } from '@/lib/trpc/client';

interface UseGameMutationsProps {
  campaignId: string;
  onPlaySuccess?: (result: {
    winningSegmentId?: string | null;
    winningCombination?: [string, string, string] | null;
    prize?: {
      id: string;
      name: string;
      description: string | null;
      value: number | null;
      color: string;
    } | null;
  }) => void;
  onCompleteConditionSuccess?: () => void;
  onCompleteGameConditionSuccess?: () => void;
}

export function useGameMutations({
  onPlaySuccess,
  onCompleteConditionSuccess,
  onCompleteGameConditionSuccess,
}: UseGameMutationsProps) {
  const playMutation = api.game.play.useMutation({
    onSuccess: (result) => {
      onPlaySuccess?.(result);
    },
  });

  const completeConditionMutation = api.condition.completeCondition.useMutation({
    onSuccess: async () => {
      onCompleteConditionSuccess?.();
    },
  });

  const completeGameConditionMutation = api.condition.completeGameCondition.useMutation({
    onSuccess: async () => {
      onCompleteGameConditionSuccess?.();
    },
  });

  return {
    playMutation,
    completeConditionMutation,
    completeGameConditionMutation,
  };
}
