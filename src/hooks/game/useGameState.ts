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

export function useGameState({
  currentStep,
  setCurrentStep,
  conditionsProgress,
  gameUser,
  isCompletingCondition,
  completeConditionIsPending,
}: UseGameStateProps) {
  useEffect(() => {
    if (!conditionsProgress || !gameUser) {
      return;
    }

    // Si on est en train de compléter une condition, ne rien faire
    // (handleConditionComplete va gérer la transition)
    if (isCompletingCondition || completeConditionIsPending) {
      return;
    }

    // Si on est en train de jouer ou si on affiche le résultat, ne PAS écraser le step
    // Ces steps sont gérés par handlePlay() et handleSpinComplete()
    if (currentStep === 'playing' || currentStep === 'result') {
      return;
    }

    // IMPORTANT: Si on vient de terminer une visite (journey-complete), ne PAS repasser automatiquement
    // aux conditions. L'utilisateur doit rescanner le QR code pour une nouvelle visite.
    // On détecte cela si le step est déjà 'journey-complete' ET qu'il reste des conditions
    if (currentStep === 'journey-complete' && !isCompletingCondition) {
      return;
    }

    // Si pas de conditions, on peut jouer directement
    if (conditionsProgress.conditions.length === 0) {
      if (!conditionsProgress.participant?.hasPlayed) {
        setCurrentStep('ready-to-play');
      } else {
        setCurrentStep('journey-complete');
      }
      return;
    }

    // NOUVEAU SYSTÈME playCount: Vérifier si l'utilisateur peut jouer
    const completedCount = conditionsProgress.completedConditions?.length || 0;
    const totalConditions = conditionsProgress.conditions?.length || 0;

    // Si il y a une condition courante à compléter ET qu'on ne peut pas encore jouer
    if (conditionsProgress.currentCondition && !conditionsProgress.canPlay) {
      setCurrentStep('conditions');
      return;
    }

    // Si on peut jouer (au moins une condition complétée de plus que le nombre de jeux)
    if (conditionsProgress.canPlay) {
      setCurrentStep('ready-to-play');
      return;
    }

    // Si toutes les conditions sont complétées => Parcours terminé
    // Peu importe le nombre de jeux joués (certaines conditions peuvent être sans jeu)
    if (completedCount >= totalConditions) {
      setCurrentStep('journey-complete');
      return;
    }

    // Si on ne peut pas jouer et qu'il reste des conditions à compléter
    // (Cas où toutes les conditions game-enabled ont été jouées au niveau store)
    if (!conditionsProgress.canPlay && completedCount < totalConditions) {
      setCurrentStep('conditions');
      return;
    }

    // Par défaut
    setCurrentStep('loading');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditionsProgress, gameUser, isCompletingCondition, completeConditionIsPending]);
}
