/**
 * Game Play Page
 * Page pour jouer au jeu de la campagne
 * Route: /play/[campaignId]
 */

'use client';

import { ConditionRenderer } from '@/components/conditions/ConditionRenderer';
import { ReadyToPlayCondition } from '@/components/conditions/ReadyToPlayCondition';
import { GamePlayHeader } from '@/components/gameplay/GamePlayHeader';
import { IdleState } from '@/components/gameplay/IdleState';
import { LoadingScreen } from '@/components/gameplay/LoadingScreen';
import { NotFoundScreen } from '@/components/gameplay/NotFoundScreen';
import { PlayingState } from '@/components/gameplay/PlayingState';
import { ResultState } from '@/components/gameplay/ResultState';
import { useGamePlayHandlers } from '@/hooks/gameplay/useGamePlayHandlers';
import { useGamePlayState } from '@/hooks/gameplay/useGamePlayState';
import { api } from '@/lib/trpc/client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function GamePlayPage() {
  const params = useParams();
  const campaignId = params.campaignId as string;

  // Hooks pour l'état et les handlers
  const { mockUser, gameState, setGameState, result, setResult, campaign, isLoading } =
    useGamePlayState(campaignId);

  const { handlePlay, handleSpinComplete } = useGamePlayHandlers({
    campaignId,
    mockUser,
    setGameState,
    setResult,
  });

  // Charger la progression des conditions
  const {
    data: progressData,
    refetch: refetchProgress,
    isLoading: isLoadingProgress,
  } = api.condition.getProgress.useQuery(
    {
      campaignId,
      participantEmail: mockUser?.email || '',
    },
    {
      enabled: !!mockUser?.email && !!campaignId,
    },
  );

  const completeConditionMutation = api.condition.completeCondition.useMutation({
    onSuccess: async () => {
      // Changer l'état IMMÉDIATEMENT pour éviter d'afficher ReadyToPlayCondition
      setGameState('playing');

      const result = await refetchProgress();

      // Si toutes les conditions sont complétées, lancer le jeu
      if (result.data?.canPlay) {
        handlePlay();
      } else {
        // Si ce n'était pas la dernière condition, revenir à idle
        setGameState('idle');
      }
    },
  });

  const handleConditionComplete = async () => {
    if (!progressData?.currentCondition || !mockUser?.email) return;

    try {
      await completeConditionMutation.mutateAsync({
        campaignId,
        participantEmail: mockUser.email,
        conditionId: progressData.currentCondition.id,
      });

      // La progression sera automatiquement rafraîchie par la query
      // L'utilisateur verra le bouton "Jouer" s'afficher quand toutes les conditions sont complétées
    } catch (error) {
      console.error('Erreur lors de la complétion de la condition:', error);
    }
  };

  // Debug log
  useEffect(() => {
    if (progressData) {
      console.log('Progress Data:', {
        conditions: progressData.conditions,
        currentCondition: progressData.currentCondition,
        canPlay: progressData.canPlay,
        participant: progressData.participant,
      });

      // Log détaillé de la condition courante pour debug URL
      if (progressData.currentCondition) {
        console.log('📋 Current Condition Details:', {
          id: progressData.currentCondition.id,
          type: progressData.currentCondition.type,
          config: progressData.currentCondition.config,
          redirectUrl: progressData.currentCondition.redirectUrl,
        });
      }
    }
  }, [progressData]);

  // Guard clauses pour les états de chargement et d'erreur
  if (isLoading || isLoadingProgress) {
    return <LoadingScreen />;
  }
  if (!campaign) {
    return <NotFoundScreen />;
  }

  // Déterminer ce qu'on doit afficher
  const showConditionRenderer =
    progressData &&
    progressData.conditions.length > 0 &&
    gameState === 'idle' &&
    progressData.currentCondition &&
    !progressData.canPlay;

  const showAlreadyPlayed =
    progressData &&
    progressData.conditions.length > 0 &&
    gameState === 'idle' &&
    progressData.canPlay &&
    progressData.participant?.hasPlayed === true;

  const showReadyToPlay =
    progressData &&
    progressData.conditions.length > 0 &&
    gameState === 'idle' &&
    progressData.canPlay &&
    progressData.participant?.hasPlayed !== true;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-linear-to-br from-purple-300 via-white to-pink-300">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
      </div>

      <div className="max-w-5xl w-full">
        <GamePlayHeader campaign={campaign} mockUser={mockUser} />

        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            {showConditionRenderer ? (
              <ConditionRenderer
                condition={progressData.currentCondition}
                userName={mockUser?.name || 'Joueur'}
                onConditionComplete={handleConditionComplete}
                totalConditions={progressData.conditions.length}
                currentConditionIndex={progressData.currentCondition.order}
              />
            ) : showAlreadyPlayed ? (
              <IdleState variant="already-played" campaignName={campaign.name} />
            ) : showReadyToPlay ? (
              <ReadyToPlayCondition
                userName={mockUser?.name || 'Joueur'}
                onPlay={handlePlay}
                totalConditions={progressData.conditions.length}
              />
            ) : gameState === 'playing' ? (
              <PlayingState
                campaign={campaign}
                result={result}
                onSpinComplete={handleSpinComplete}
              />
            ) : gameState === 'result' && result ? (
              <ResultState result={result} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
