/**
 * Game step renderer component
 */
import type { GameStep } from '@/hooks/game/useGameState';
import type { GameResult } from '@/types/game.types';
import { ConditionsStep } from './ConditionsStep';
import { ReadyToPlayStep } from './ReadyToPlayStep';
import { GamePlayStep } from './GamePlayStep';
import { ResultStep } from './ResultStep';
import { JourneyCompleteStep } from './JourneyCompleteStep';
import type { GameType } from '@/generated/prisma';

interface GameStepRendererProps {
  currentStep: GameStep;
  conditionsProgress: unknown;
  gameResult: GameResult | null;
  gameType: GameType | undefined;
  gameConfig: unknown;
  isCompletingCondition: boolean;
  isCompleteConditionPending: boolean;
  isPlayPending: boolean;
  onConditionComplete: () => void;
  onPlay: () => void;
  onSpinComplete: () => void;
}

export function GameStepRenderer({
  currentStep,
  conditionsProgress,
  gameResult,
  gameType,
  gameConfig,
  isCompletingCondition,
  isCompleteConditionPending,
  isPlayPending,
  onConditionComplete,
  onPlay,
  onSpinComplete,
}: GameStepRendererProps) {
  const progress = conditionsProgress as
    | {
        currentCondition?: {
          id: string;
          type: string;
          config: Record<string, unknown>;
        };
        conditions: Array<{ id: string; title: string; iconEmoji: string | null }>;
        completedConditions: string[] | null;
        participant: { playCount: number } | null;
      }
    | undefined;

  if (currentStep === 'conditions' && progress?.currentCondition) {
    return (
      <ConditionsStep
        currentCondition={progress.currentCondition as never}
        totalConditions={progress.conditions.length}
        onConditionComplete={onConditionComplete}
      />
    );
  }

  if (currentStep === 'ready-to-play' && !isCompletingCondition && !isCompleteConditionPending) {
    return (
      <ReadyToPlayStep
        conditionsProgress={progress as never}
        onPlay={onPlay}
        isPlayPending={isPlayPending}
      />
    );
  }

  if (currentStep === 'playing') {
    return (
      <GamePlayStep
        gameType={gameType}
        gameConfig={gameConfig}
        gameResult={gameResult}
        onSpinComplete={onSpinComplete}
      />
    );
  }

  if (currentStep === 'result' && gameResult?.prize) {
    return <ResultStep prize={gameResult.prize} />;
  }

  if (currentStep === 'journey-complete' && progress) {
    return <JourneyCompleteStep conditionsProgress={progress as never} />;
  }

  return null;
}
