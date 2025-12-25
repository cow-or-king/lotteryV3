/**
 * Game Page - Refactored with clean architecture
 * Route: /game/[campaignId]
 *
 * Flow complet:
 * 1. Vérifier conditions store-level
 * 2. Afficher condition courante OU jeu OU résultat OU fin de parcours
 * 3. Conditions validées = persistent au niveau store (pas campagne)
 * 4. Condition GAME = TRUE seulement après affichage du prize
 */

'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { useGameUser } from '@/hooks/game/useGameUser';
import { useGameMutations } from '@/hooks/game/useGameMutations';
import { useGameState, type GameStep } from '@/hooks/game/useGameState';
import { useGameHandlers } from '@/hooks/game/useGameHandlers';
import { GameLoading } from '@/components/game/GameLoading';
import { NotFoundScreen } from '@/components/game/NotFoundScreen';
import { GameStepRenderer } from '@/components/game/GameStepRenderer';
import type { GameResult } from '@/types/game.types';
import type { GameType } from '@/generated/prisma';

export default function GamePage() {
  const params = useParams();
  const campaignId = params.campaignId as string;
  const [currentStep, setCurrentStep] = useState<GameStep>('loading');
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // Custom hooks
  const gameUser = useGameUser();

  // Data fetching
  const { data: campaign, isLoading: isLoadingCampaign } = api.campaign.getByIdPublic.useQuery(
    { id: campaignId },
    { enabled: !!campaignId },
  );

  const {
    data: conditionsProgress,
    isLoading: isLoadingProgress,
    refetch: refetchProgress,
  } = api.condition.getProgress.useQuery(
    {
      campaignId,
      participantEmail: gameUser?.email || '',
    },
    {
      enabled: !!campaignId && !!gameUser?.email,
    },
  );

  // Mutations
  const { playMutation, completeConditionMutation, completeGameConditionMutation } =
    useGameMutations({
      campaignId,
      onPlaySuccess: (result) => setGameResult(result),
      onCompleteConditionSuccess: () => refetchProgress(),
      onCompleteGameConditionSuccess: () => refetchProgress(),
    });

  // Game handlers
  const { handlePlay, handleSpinComplete, handleConditionComplete, isCompletingCondition } =
    useGameHandlers({
      campaignId,
      gameUser,
      playMutation,
      completeConditionMutation,
      completeGameConditionMutation,
      conditionsProgress,
      setCurrentStep,
      setGameResult,
    });

  // Step determination logic
  useGameState({
    currentStep,
    setCurrentStep,
    conditionsProgress,
    gameUser,
    isCompletingCondition,
    completeConditionIsPending: completeConditionMutation.isPending,
  });

  // Loading and error states
  if (isLoadingCampaign || isLoadingProgress || currentStep === 'loading') {
    return <GameLoading />;
  }

  if (!campaign) {
    return <NotFoundScreen />;
  }

  const gameType = campaign.game?.type as GameType | undefined;
  const gameConfig = campaign.game?.config;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-linear-to-br from-purple-300 via-white to-pink-300">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
      </div>

      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-gray-700 text-sm font-medium mb-2">Campagne</p>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{campaign.name}</h1>
          {gameUser && <p className="text-gray-600">Bienvenue {gameUser.name} !</p>}
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <GameStepRenderer
              currentStep={currentStep}
              conditionsProgress={conditionsProgress}
              gameResult={gameResult}
              gameType={gameType}
              gameConfig={gameConfig}
              isCompletingCondition={isCompletingCondition}
              isCompleteConditionPending={completeConditionMutation.isPending}
              isPlayPending={playMutation.isPending}
              onConditionComplete={handleConditionComplete}
              onPlay={handlePlay}
              onSpinComplete={handleSpinComplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
