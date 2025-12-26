/**
 * Hook to determine the current game step based on conditions progress
 */
import { useEffect } from 'react';
import type { ConditionType } from '@/generated/prisma';

export type GameStep =
  | 'loading'
  | 'conditions'
  | 'ready-to-play'
  | 'playing'
  | 'result'
  | 'journey-complete';

interface ConditionsProgress {
  canPlay: boolean;
  currentCondition: {
    id: string;
    type: ConditionType;
    order: number;
    title: string;
    description: string | null;
    redirectUrl: string | null;
    iconEmoji: string | null;
    config: unknown;
    isRequired: boolean;
    createdAt: string;
    updatedAt: string;
    campaignId: string;
    enablesGame?: boolean;
  } | null;
  conditions: Array<{
    id: string;
    type: ConditionType;
    order: number;
    title: string;
    description: string | null;
    redirectUrl: string | null;
    iconEmoji: string | null;
    config: unknown;
    isRequired: boolean;
    enablesGame?: boolean;
    createdAt: string;
    updatedAt: string;
    campaignId: string;
  }>;
  completedConditions: string[] | null;
  participant: {
    hasPlayed: boolean;
    playCount: number;
  } | null;
  nextPlayableConditionId?: string | null;
}

interface UseGameStateProps {
  currentStep: GameStep;
  setCurrentStep: (step: GameStep) => void;
  conditionsProgress: ConditionsProgress | undefined;
  gameUser: { id: string; email: string; name: string } | null;
  isCompletingCondition: boolean;
  completeConditionIsPending: boolean;
}

/**
 * Check if we should skip step updates due to early return conditions
 */
function shouldSkipStepUpdate(
  conditionsProgress: ConditionsProgress | undefined,
  gameUser: { id: string; email: string; name: string } | null,
  isCompletingCondition: boolean,
  completeConditionIsPending: boolean,
  currentStep: GameStep,
): boolean {
  if (!conditionsProgress || !gameUser) {
    return true;
  }

  if (isCompletingCondition || completeConditionIsPending) {
    return true;
  }

  if (currentStep === 'playing' || currentStep === 'result') {
    return true;
  }

  if (currentStep === 'journey-complete' && !isCompletingCondition) {
    return true;
  }

  return false;
}

/**
 * Determine the game step when there are no conditions
 */
function getStepWithNoConditions(conditionsProgress: ConditionsProgress): GameStep {
  if (!conditionsProgress.participant?.hasPlayed) {
    return 'ready-to-play';
  }
  return 'journey-complete';
}

/**
 * Check if all conditions are completed
 */
function areAllConditionsCompleted(completedCount: number, totalConditions: number): boolean {
  return completedCount >= totalConditions;
}

/**
 * Check if user should see conditions screen
 */
function shouldShowConditions(conditionsProgress: ConditionsProgress, canPlay: boolean): boolean {
  return Boolean(conditionsProgress.currentCondition && !canPlay);
}

/**
 * Check if there are remaining conditions but user cannot play
 */
function hasRemainingConditionsButCannotPlay(
  canPlay: boolean,
  completedCount: number,
  totalConditions: number,
): boolean {
  return !canPlay && completedCount < totalConditions;
}

/**
 * Determine the appropriate game step based on conditions progress
 */
function determineGameStep(
  conditionsProgress: ConditionsProgress,
  completedCount: number,
  totalConditions: number,
): GameStep {
  const canPlay = conditionsProgress.canPlay;

  if (shouldShowConditions(conditionsProgress, canPlay)) {
    return 'conditions';
  }

  if (canPlay) {
    return 'ready-to-play';
  }

  if (areAllConditionsCompleted(completedCount, totalConditions)) {
    return 'journey-complete';
  }

  if (hasRemainingConditionsButCannotPlay(canPlay, completedCount, totalConditions)) {
    return 'conditions';
  }

  return 'loading';
}

export function useGameState({
  currentStep,
  setCurrentStep,
  conditionsProgress,
  gameUser,
  isCompletingCondition,
  completeConditionIsPending,
}: UseGameStateProps) {
  useEffect(() => {
    if (
      shouldSkipStepUpdate(
        conditionsProgress,
        gameUser,
        isCompletingCondition,
        completeConditionIsPending,
        currentStep,
      )
    ) {
      return;
    }

    // Si pas de conditions, on peut jouer directement
    if (conditionsProgress && conditionsProgress.conditions.length === 0) {
      const step = getStepWithNoConditions(conditionsProgress);
      setCurrentStep(step);
      return;
    }

    // NOUVEAU SYSTÈME playCount: Vérifier si l'utilisateur peut jouer
    if (conditionsProgress) {
      const completedCount = conditionsProgress.completedConditions?.length || 0;
      const totalConditions = conditionsProgress.conditions?.length || 0;

      const step = determineGameStep(conditionsProgress, completedCount, totalConditions);
      setCurrentStep(step);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditionsProgress, gameUser, isCompletingCondition, completeConditionIsPending]);
}
