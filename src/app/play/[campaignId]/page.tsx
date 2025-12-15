/**
 * Game Play Page
 * Page pour jouer au jeu de la campagne
 * Route: /play/[campaignId]
 */

'use client';

import { useParams } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { Gift, Sparkles, Trophy, PartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';
import WheelGame from '@/components/games/WheelGame';
import type { WheelGameConfig } from '@/lib/types/game.types';
import { toast } from 'sonner';

type GameState = 'idle' | 'playing' | 'result';

export default function GamePlayPage() {
  const params = useParams();
  const campaignId = params.campaignId as string;
  const [mockUser, setMockUser] = useState<{ name: string; email: string } | null>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [result, setResult] = useState<{
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
  } | null>(null);

  // Récupérer la campagne avec l'API publique
  const { data: campaign, isLoading } = api.game.getCampaignPublic.useQuery(
    { id: campaignId },
    { enabled: !!campaignId },
  );

  // Debug: afficher les données de la campagne
  useEffect(() => {
    if (campaign) {
      console.log('Campaign data:', campaign);
      console.log('Game config:', campaign.game);
    }
  }, [campaign]);

  // Mutation pour jouer
  const playMutation = api.game.play.useMutation();

  // Vérifier l'utilisateur mockup au chargement
  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setMockUser(JSON.parse(storedUser));
    }
  }, []);

  const handlePlay = async () => {
    if (!mockUser || !campaignId) return;

    console.log('🎮 Starting game...');

    // Vérifier que mockUser existe
    if (!mockUser) {
      console.error('❌ No mockUser found!');
      toast.error('Erreur: utilisateur non connecté');
      return;
    }

    console.log('📞 Calling API BEFORE spinning to get the result...');

    // Appeler l'API AVANT de faire tourner la roue
    try {
      const playResult = await playMutation.mutateAsync({
        campaignId,
        playerEmail: mockUser.email,
        playerName: mockUser.name,
      });

      console.log('✅ API result:', playResult);

      // Sauvegarder le résultat pour l'afficher après l'animation
      setResult(playResult);

      // Maintenant on peut passer à l'état "playing" pour afficher la roue
      setGameState('playing');
    } catch (error) {
      console.error('❌ API error:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const handleSpinComplete = () => {
    console.log('🎯 Wheel animation complete, showing result');
    // L'animation de la roue est terminée, on affiche le résultat
    setGameState('result');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
          <p className="mt-4 text-white text-lg">Chargement du jeu...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
        <div className="text-center text-white max-w-md mx-4">
          <h1 className="text-3xl font-bold mb-4">Campagne introuvable</h1>
          <p className="text-gray-300">Cette campagne n'existe pas ou n'est plus active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              {mockUser && (
                <p className="text-sm text-purple-100 mt-1">Bienvenue, {mockUser.name}</p>
              )}
            </div>
            <Trophy className="h-12 w-12 text-yellow-300" />
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            {/* État IDLE: Prêt à jouer */}
            {gameState === 'idle' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-6 animate-pulse">
                  <Sparkles className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Prêt à tenter votre chance ?
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Cliquez sur le bouton pour découvrir si vous avez gagné un lot !
                </p>
                <button
                  onClick={handlePlay}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-5 px-12 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg text-xl"
                >
                  JOUER MAINTENANT
                </button>
              </div>
            )}

            {/* État PLAYING: Roue de la fortune */}
            {gameState === 'playing' && campaign.game?.config && (
              <div className="text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-8">Tournez la roue !</h2>
                <WheelGame
                  config={campaign.game.config as unknown as WheelGameConfig}
                  primaryColor="#7C3AED"
                  secondaryColor="#EC4899"
                  onSpinComplete={handleSpinComplete}
                  forcedSegmentId={result?.winningSegmentId || null}
                />
              </div>
            )}

            {/* État RESULT: Affichage du résultat */}
            {gameState === 'result' && result && (
              <div className="text-center">
                {result.hasWon && result.prize ? (
                  <>
                    <div
                      className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 animate-bounce"
                      style={{ backgroundColor: result.prize.color }}
                    >
                      <PartyPopper className="h-16 w-16 text-white" />
                    </div>
                    <h2 className="text-5xl font-bold text-green-600 mb-4">FÉLICITATIONS !</h2>
                    <p className="text-2xl text-gray-900 mb-6">Vous avez gagné :</p>
                    <div className="bg-gray-50 rounded-2xl p-8 mb-8 border-4 border-green-500">
                      <h3 className="text-3xl font-bold mb-2" style={{ color: result.prize.color }}>
                        {result.prize.name}
                      </h3>
                      {result.prize.description && (
                        <p className="text-gray-600 mb-4">{result.prize.description}</p>
                      )}
                      {result.prize.value && (
                        <p className="text-2xl font-bold text-purple-600">
                          Valeur: {result.prize.value}€
                        </p>
                      )}
                    </div>
                    {result.claimCode && (
                      <div className="bg-purple-50 rounded-xl p-6 mb-6 border-2 border-purple-300">
                        <p className="text-sm text-gray-600 mb-2">Votre code de réclamation :</p>
                        <p className="text-3xl font-mono font-bold text-purple-700 tracking-wider">
                          {result.claimCode}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Notez bien ce code, il vous sera demandé en magasin
                        </p>
                      </div>
                    )}
                    <p className="text-gray-600 text-lg">
                      Présentez-vous en magasin pour récupérer votre lot !
                    </p>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-300 mb-6">
                      <Gift className="h-16 w-16 text-gray-600" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-700 mb-4">
                      Pas de chance cette fois...
                    </h2>
                    <p className="text-gray-600 text-lg mb-8">Merci d'avoir participé !</p>
                    <p className="text-gray-500 text-sm">
                      Revenez nous voir en magasin pour une prochaine opportunité
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Lots disponibles (affiché uniquement en mode idle) */}
            {gameState === 'idle' && (
              <div className="border-t border-gray-200 pt-8 mt-12">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Gift className="h-6 w-6 text-purple-600" />
                  Lots à gagner ({campaign.prizes?.length || 0})
                </h3>

                {campaign.prizes && campaign.prizes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaign.prizes.map((prize) => (
                      <div
                        key={prize.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div
                              className="w-4 h-4 rounded-full mb-2"
                              style={{ backgroundColor: prize.color }}
                            />
                            <h4 className="font-semibold text-gray-900">{prize.name}</h4>
                            {prize.description && (
                              <p className="text-sm text-gray-600 mt-1">{prize.description}</p>
                            )}
                            {prize.value && (
                              <p className="text-sm font-medium text-purple-600 mt-2">
                                Valeur: {prize.value}€
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {prize.remaining}/{prize.quantity}
                            </div>
                            <div className="text-xs text-gray-400">restants</div>
                            <div className="text-xs text-purple-600 mt-1">{prize.probability}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucun lot configuré</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
