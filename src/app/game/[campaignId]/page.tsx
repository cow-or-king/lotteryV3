/**
 * Game Page - Nouvelle architecture propre
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
import { useState, useEffect } from 'react';
import { api } from '@/lib/trpc/client';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import WheelGame from '@/components/games/WheelGame';
import SlotMachineGame from '@/components/games/SlotMachineGame';
import { ConditionRenderer } from '@/components/conditions/ConditionRenderer';
import type { WheelGameConfig, SlotMachineGameConfig } from '@/lib/types/game.types';
import { Gift, Sparkles } from 'lucide-react';

type GameStep =
  | 'loading'
  | 'conditions'
  | 'ready-to-play'
  | 'playing'
  | 'result'
  | 'journey-complete';

interface GameResult {
  winningSegmentId?: string | null;
  winningCombination?: [string, string, string] | null;
  prize?: {
    id: string;
    name: string;
    description?: string;
    value?: number;
  } | null;
}

export default function GamePage() {
  const params = useParams();
  const campaignId = params.campaignId as string;
  const [currentStep, setCurrentStep] = useState<GameStep>('loading');
  const [gameUser, setGameUser] = useState<{ id: string; email: string; name: string } | null>(
    null,
  );
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isCompletingCondition, setIsCompletingCondition] = useState(false);

  // Récupérer le gameUser depuis les cookies
  useEffect(() => {
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      return null;
    };

    const userCookie = getCookie('cb-game-user');
    if (userCookie) {
      try {
        setGameUser(JSON.parse(decodeURIComponent(userCookie)));
      } catch (e) {
        console.error('Error parsing game user cookie:', e);
      }
    }
  }, []);

  // Charger la campagne avec game et prizes
  const { data: campaign, isLoading: isLoadingCampaign } = api.campaign.getByIdPublic.useQuery(
    { id: campaignId },
    { enabled: !!campaignId },
  );

  // Charger la progression des conditions
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

  // Mutation pour compléter une condition
  const completeConditionMutation = api.condition.completeCondition.useMutation({
    onSuccess: async () => {
      await refetchProgress();
    },
  });

  // Mutation pour compléter la condition GAME (appelée après affichage du prize)
  const completeGameConditionMutation = api.condition.completeGameCondition.useMutation({
    onSuccess: async () => {
      await refetchProgress();
    },
  });

  // Mutation pour jouer
  const playMutation = api.game.play.useMutation({
    onSuccess: (result) => {
      setGameResult(result);
    },
  });

  // Rediriger vers la landing page si pas de gameUser
  useEffect(() => {
    // Attendre un peu pour être sûr que les cookies sont chargés
    const timer = setTimeout(() => {
      if (!gameUser && !isLoadingCampaign) {
        // Pas de gameUser = pas authentifié, on ne peut pas déterminer le shortCode
        // On reste en loading ou on affiche un message
        console.log('⚠️ Pas de gameUser, utilisateur non authentifié');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameUser, isLoadingCampaign]);

  // Déterminer l'étape courante basée sur les conditions
  useEffect(() => {
    console.log('🔍 Détermination étape:', {
      currentStep,
      hasConditionsProgress: !!conditionsProgress,
      hasGameUser: !!gameUser,
      isCompletingCondition,
      isPendingMutation: completeConditionMutation.isPending,
      conditionsProgress,
    });

    if (!conditionsProgress || !gameUser) return;

    // Si on est en train de compléter une condition, ne rien faire
    // (handleConditionComplete va gérer la transition)
    if (isCompletingCondition || completeConditionMutation.isPending) {
      console.log('⏳ Complétion condition en cours, skip');
      return;
    }

    // Si on est en train de jouer ou si on affiche le résultat, ne PAS écraser le step
    // Ces steps sont gérés par handlePlay() et handleSpinComplete()
    if (currentStep === 'playing' || currentStep === 'result') {
      console.log('🎮 En jeu ou résultat affiché, ne pas changer le step');
      return;
    }

    // IMPORTANT: Si on vient de terminer une visite (journey-complete), ne PAS repasser automatiquement
    // aux conditions. L'utilisateur doit rescanner le QR code pour une nouvelle visite.
    // On détecte cela si le step est déjà 'journey-complete' ET qu'il reste des conditions
    if (currentStep === 'journey-complete' && !isCompletingCondition) {
      console.log('🛑 Visite terminée, attente du prochain scan');
      return;
    }

    // Si pas de conditions, on peut jouer directement
    if (conditionsProgress.conditions.length === 0) {
      console.log('✅ Pas de conditions, prêt à jouer');
      if (!conditionsProgress.participant?.hasPlayed) {
        setCurrentStep('ready-to-play');
      } else {
        setCurrentStep('journey-complete');
      }
      return;
    }

    // NOUVEAU SYSTÈME playCount: Vérifier si l'utilisateur peut jouer
    const playCount = conditionsProgress.participant?.playCount || 0;
    const completedCount = conditionsProgress.completedConditions?.length || 0;
    const totalConditions = conditionsProgress.conditions?.length || 0;

    // Compter les conditions qui donnent accès au jeu
    const gameEnabledConditions = conditionsProgress.conditions?.filter((c) => c.enablesGame) || [];
    const gameEnabledCount = gameEnabledConditions.length;

    console.log('📊 Stats:', {
      completedCount,
      totalConditions,
      gameEnabledCount,
      playCount,
      canPlay: conditionsProgress.canPlay,
      currentCondition: conditionsProgress.currentCondition,
    });

    // Si il y a une condition courante à compléter ET qu'on ne peut pas encore jouer
    if (conditionsProgress.currentCondition && !conditionsProgress.canPlay) {
      console.log('✅ Condition courante à compléter:', conditionsProgress.currentCondition);
      setCurrentStep('conditions');
      return;
    }

    // Si on peut jouer (au moins une condition complétée de plus que le nombre de jeux)
    if (conditionsProgress.canPlay) {
      console.log('✅ Peut jouer, prêt à jouer');
      setCurrentStep('ready-to-play');
      return;
    }

    // Si toutes les conditions sont complétées => Parcours terminé
    // Peu importe le nombre de jeux joués (certaines conditions peuvent être sans jeu)
    if (completedCount >= totalConditions) {
      console.log('✅ Toutes conditions complétées, parcours terminé');
      setCurrentStep('journey-complete');
      return;
    }

    // Si on ne peut pas jouer et qu'il reste des conditions à compléter
    // (Cas où toutes les conditions game-enabled ont été jouées au niveau store)
    if (!conditionsProgress.canPlay && completedCount < totalConditions) {
      console.log('✅ Ne peut plus jouer mais il reste des conditions à compléter');
      setCurrentStep('conditions');
      return;
    }

    // Par défaut
    console.log('⚠️ État par défaut: loading');
    setCurrentStep('loading');
  }, [conditionsProgress, gameUser, isCompletingCondition, completeConditionMutation.isPending]);

  const handlePlay = async () => {
    if (!gameUser?.email) return;

    setCurrentStep('playing');

    try {
      await playMutation.mutateAsync({
        campaignId,
        playerEmail: gameUser.email,
        playerName: gameUser.name || 'Joueur',
      });
    } catch (error) {
      console.error('Erreur lors du jeu:', error);
    }
  };

  const handleSpinComplete = async () => {
    // Quand l'animation est terminée, afficher le résultat
    setCurrentStep('result');

    // Compléter la condition GAME si elle existe
    if (gameUser?.email) {
      try {
        await completeGameConditionMutation.mutateAsync({
          campaignId,
          participantEmail: gameUser.email,
        });
      } catch (error) {
        console.error('Erreur lors de la complétion de la condition GAME:', error);
      }
    }

    // Après 3 secondes d'affichage du résultat, passer à "journey-complete"
    // pour bloquer et forcer un nouveau scan
    setTimeout(() => {
      console.log('🛑 Fin de visite après résultat du jeu');
      setCurrentStep('journey-complete');
    }, 3000);
  };

  const handleConditionComplete = async () => {
    if (!conditionsProgress?.currentCondition || !gameUser?.email) return;

    try {
      setIsCompletingCondition(true);

      const result = await completeConditionMutation.mutateAsync({
        campaignId,
        participantEmail: gameUser.email,
        conditionId: conditionsProgress.currentCondition.id,
      });

      // Si la condition complétée donne accès au jeu, lancer le jeu
      if (result.canPlay && result.enablesGame) {
        console.log('🎮 Condition complétée avec jeu, lancement direct');
        // Forcer directement le passage au jeu sans passer par ready-to-play
        setCurrentStep('playing');
        await handlePlay();
        setIsCompletingCondition(false);
      } else {
        console.log('🛑 Condition complétée sans jeu, fin de visite');
        // Condition complétée SANS jeu → Arrêter ici et attendre le prochain scan
        // NE PAS refetch pour ne pas passer à la condition suivante
        setCurrentStep('journey-complete');
        setIsCompletingCondition(false);
      }
    } catch (error) {
      console.error('Erreur lors de la complétion de la condition:', error);
      setIsCompletingCondition(false);
    }
  };

  // Loading state
  if (isLoadingCampaign || isLoadingProgress || currentStep === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <AnimatedBackground />
        <GlassCard className="p-8 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-white text-lg font-medium">Chargement...</p>
        </GlassCard>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <AnimatedBackground />
        <GlassCard className="p-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-white mb-4">Campagne introuvable</h1>
          <p className="text-white/70">Cette campagne n'existe pas ou n'est plus active.</p>
        </GlassCard>
      </div>
    );
  }

  const gameType = campaign.game?.type;
  const gameConfig = campaign.game?.config;

  console.log('🎮 Game Debug:', { gameType, hasConfig: !!gameConfig, campaign: campaign.game });

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
            {/* CONDITIONS STEP */}
            {currentStep === 'conditions' && conditionsProgress?.currentCondition && (
              <ConditionRenderer
                condition={conditionsProgress.currentCondition}
                userName={gameUser?.name || 'Joueur'}
                onConditionComplete={handleConditionComplete}
                totalConditions={conditionsProgress.conditions.length}
                currentConditionIndex={conditionsProgress.currentCondition.order}
              />
            )}

            {/* READY TO PLAY STEP */}
            {currentStep === 'ready-to-play' &&
              !isCompletingCondition &&
              !completeConditionMutation.isPending && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Prêt à jouer !</h2>

                  {/* Afficher quelle condition donne accès au jeu */}
                  {conditionsProgress?.nextPlayableConditionId && (
                    <>
                      {(() => {
                        const playableCondition = conditionsProgress.conditions.find(
                          (c) => c.id === conditionsProgress.nextPlayableConditionId,
                        );
                        if (playableCondition) {
                          return (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 max-w-md mx-auto">
                              <p className="text-green-800 font-medium mb-2">
                                {playableCondition.iconEmoji}{' '}
                                <span className="font-bold">{playableCondition.title}</span> validée
                                !
                              </p>
                              <p className="text-green-700 text-sm">
                                Cette condition vous donne accès au jeu de cette campagne
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </>
                  )}

                  <p className="text-gray-600 mb-8">
                    Tentez votre chance et gagnez un prize à coup sûr !
                  </p>
                  <button
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full hover:shadow-xl transform hover:scale-105 transition-all"
                    onClick={handlePlay}
                    disabled={playMutation.isPending}
                  >
                    {playMutation.isPending ? 'Chargement...' : 'Lancer le jeu'}
                  </button>
                </div>
              )}

            {/* PLAYING STEP */}
            {currentStep === 'playing' && (
              <div className="text-center">
                {(gameType === 'WHEEL' || gameType === 'WHEEL_MINI') && gameConfig ? (
                  <>
                    <h2 className="text-4xl font-bold text-gray-900 mb-8">Tournez la roue !</h2>
                    <WheelGame
                      config={gameConfig as unknown as WheelGameConfig}
                      primaryColor="#7C3AED"
                      secondaryColor="#EC4899"
                      onSpinComplete={handleSpinComplete}
                      forcedSegmentId={gameResult?.winningSegmentId || null}
                    />
                  </>
                ) : gameType === 'SLOT_MACHINE' && gameConfig ? (
                  <>
                    <h2 className="text-4xl font-bold text-gray-900 mb-8">Lancez la machine !</h2>
                    <SlotMachineGame
                      config={gameConfig as unknown as SlotMachineGameConfig}
                      primaryColor="#FBBF24"
                      secondaryColor="#DC2626"
                      onSpinComplete={handleSpinComplete}
                      forcedCombination={
                        (gameResult?.winningCombination as [string, string, string]) || null
                      }
                    />
                  </>
                ) : (
                  <div className="py-12">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 mb-6">
                      <Gift className="h-16 w-16 text-gray-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Jeu non configuré</h2>
                    <p className="text-gray-600 text-lg">
                      Cette campagne n'a pas de jeu configuré.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* RESULT STEP */}
            {currentStep === 'result' && gameResult?.prize && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center mb-6 animate-bounce">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                    <Gift className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4">🎉 Félicitations !</h2>
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6 mb-6">
                  <p className="text-lg font-medium mb-2">Vous avez gagné</p>
                  <h3 className="text-3xl font-bold mb-2">{gameResult.prize.name}</h3>
                  {gameResult.prize.description && (
                    <p className="text-white/90">{gameResult.prize.description}</p>
                  )}
                  {gameResult.prize.value && (
                    <p className="text-2xl font-bold mt-4">{gameResult.prize.value}€</p>
                  )}
                </div>
                <p className="text-gray-600 mb-4">
                  Montrez cet écran au commerçant pour récupérer votre prize !
                </p>
              </div>
            )}

            {/* JOURNEY COMPLETE STEP */}
            {currentStep === 'journey-complete' && conditionsProgress && (
              <div className="text-center">
                {(() => {
                  const playCount = conditionsProgress.participant?.playCount || 0;
                  const completedCount = conditionsProgress.completedConditions?.length || 0;
                  const totalConditions = conditionsProgress.conditions?.length || 0;
                  const allCompleted =
                    completedCount >= totalConditions && playCount >= totalConditions;

                  return (
                    <>
                      <div className="inline-flex items-center justify-center mb-6">
                        <div
                          className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl ${
                            allCompleted
                              ? 'bg-gradient-to-br from-green-400 to-emerald-600 animate-pulse'
                              : 'bg-gradient-to-br from-purple-400 to-pink-600'
                          }`}
                        >
                          <span className="text-6xl">{allCompleted ? '🎉' : '⏸️'}</span>
                        </div>
                      </div>

                      {allCompleted ? (
                        <>
                          <h2 className="text-4xl font-bold text-gray-800 mb-4">
                            Parcours terminé !
                          </h2>
                          <p className="text-gray-600 mb-6">
                            Vous avez complété toutes les étapes de cette campagne et joué à tous
                            les jeux disponibles.
                          </p>
                        </>
                      ) : (
                        <>
                          <h2 className="text-4xl font-bold text-gray-800 mb-4">À bientôt !</h2>
                          <p className="text-gray-600 mb-6">
                            Vous avez joué pour cette étape. Revenez plus tard pour compléter la
                            prochaine condition et rejouer !
                          </p>
                          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                            <p className="text-blue-800 font-medium">
                              📊 Progression: {completedCount}/{totalConditions} conditions
                              complétées
                            </p>
                            <p className="text-blue-600 text-sm mt-2">
                              🎮 {playCount} jeu{playCount > 1 ? 'x' : ''} joué
                              {playCount > 1 ? 's' : ''}
                            </p>
                          </div>
                        </>
                      )}

                      {conditionsProgress.conditions.length > 0 && (
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
                          <p className="text-sm font-medium text-gray-700 mb-3">Conditions :</p>
                          <div className="space-y-2">
                            {conditionsProgress.conditions.map((condition, index) => {
                              const isCompleted = conditionsProgress.completedConditions.includes(
                                condition.id,
                              );
                              return (
                                <div
                                  key={condition.id}
                                  className="flex items-center gap-2 text-gray-700"
                                >
                                  <span
                                    className={isCompleted ? 'text-green-500' : 'text-gray-300'}
                                  >
                                    {isCompleted ? '✓' : '○'}
                                  </span>
                                  <span className={`text-sm ${isCompleted ? '' : 'text-gray-400'}`}>
                                    {condition.iconEmoji} {condition.title}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <p className="text-gray-500 text-sm">
                        {allCompleted
                          ? 'Merci pour votre participation ! Revenez bientôt pour de nouvelles campagnes.'
                          : 'Scannez à nouveau le QR code lors de votre prochaine visite pour continuer !'}
                      </p>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
