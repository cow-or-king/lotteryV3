/**
 * Game Play Page
 * Page pour jouer au jeu de la campagne
 * Route: /play/[campaignId]
 */

'use client';

import { useParams } from 'next/navigation';
import { useGamePlayState } from '@/hooks/gameplay/useGamePlayState';
import { useGamePlayHandlers } from '@/hooks/gameplay/useGamePlayHandlers';
import { LoadingScreen } from '@/components/gameplay/LoadingScreen';
import { NotFoundScreen } from '@/components/gameplay/NotFoundScreen';
import { GamePlayHeader } from '@/components/gameplay/GamePlayHeader';
import { IdleState } from '@/components/gameplay/IdleState';
import { PlayingState } from '@/components/gameplay/PlayingState';
import { ResultState } from '@/components/gameplay/ResultState';
import { PrizesListSection } from '@/components/gameplay/PrizesListSection';

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

  // Guard clauses pour les états de chargement et d'erreur
  if (isLoading) {
    return <LoadingScreen />;
  }
  if (!campaign) {
    return <NotFoundScreen />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-500 to-pink-500 p-4">
      <GamePlayHeader campaign={campaign} mockUser={mockUser} />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            {gameState === 'idle' && <IdleState onPlay={handlePlay} />}

            {gameState === 'playing' && (
              <PlayingState
                campaign={campaign}
                result={result}
                onSpinComplete={handleSpinComplete}
              />
            )}

            {gameState === 'result' && result && <ResultState result={result} />}

            {gameState === 'idle' && <PrizesListSection campaign={campaign} />}
          </div>
        </div>
      </div>
    </div>
  );
}
