/**
 * Game Public Router
 * Routes tRPC publiques pour les joueurs (sans auth)
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';
import { playGameSchema } from './game-schemas';
import { ValidateCampaignForPlayUseCase } from '@/core/use-cases/game/validate-campaign-for-play.use-case';
import { CheckPlayEligibilityUseCase } from '@/core/use-cases/game/check-play-eligibility.use-case';
import { ExecuteGameDrawUseCase } from '@/core/use-cases/game/execute-game-draw.use-case';
import { DetermineWinningResultUseCase } from '@/core/use-cases/game/determine-winning-result.use-case';

export const gamePublicRouter = createTRPCRouter({
  /**
   * Jouer au jeu d'une campagne (PUBLIC - sans auth)
   * Effectue un tirage au sort basé sur les probabilités des lots
   * Refactorisé en use cases pour réduire la complexité
   */
  play: publicProcedure.input(playGameSchema).mutation(async ({ input }) => {
    // 1. Valider la campagne
    const validateCampaignUseCase = new ValidateCampaignForPlayUseCase();
    const campaignResult = await validateCampaignUseCase.execute({
      campaignId: input.campaignId,
    });

    if (!campaignResult.success) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: campaignResult.error.message,
      });
    }

    const { campaign } = campaignResult.data;

    // 2. Vérifier l'éligibilité du joueur
    const checkEligibilityUseCase = new CheckPlayEligibilityUseCase();
    const eligibilityResult = await checkEligibilityUseCase.execute({
      campaign,
      playerEmail: input.playerEmail,
    });

    if (!eligibilityResult.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: eligibilityResult.error.message,
      });
    }

    const { nextPlayableConditionId, playableConditionType } = eligibilityResult.data;

    // 3. Exécuter le tirage au sort
    const executeDrawUseCase = new ExecuteGameDrawUseCase();
    const drawResult = await executeDrawUseCase.execute({
      campaign,
      playerEmail: input.playerEmail,
      playerName: input.playerName,
      nextPlayableConditionId,
      playableConditionType,
    });

    if (!drawResult.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: drawResult.error.message,
      });
    }

    const {
      participant,
      wonPrizeId,
      claimCode,
      wonPrizeName,
      wonPrizeDescription,
      wonPrizeValue,
      wonPrizeColor,
    } = drawResult.data;

    // 4. Déterminer le résultat gagnant pour l'animation
    const determineResultUseCase = new DetermineWinningResultUseCase();
    const resultData = determineResultUseCase.execute({
      campaign,
      wonPrizeId,
    });

    if (!resultData.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: resultData.error.message,
      });
    }

    const { winningSegmentId, winningCombination } = resultData.data;

    // Retourner le résultat
    return {
      hasWon: wonPrizeId !== null,
      prize: wonPrizeId
        ? {
            id: wonPrizeId,
            name: wonPrizeName || '',
            description: wonPrizeDescription,
            value: wonPrizeValue,
            color: wonPrizeColor || '#000000',
          }
        : null,
      participantId: participant.id,
      claimCode,
      winningSegmentId,
      winningCombination,
    };
  }),

  /**
   * Récupérer une campagne publique (PUBLIC - sans auth)
   */
  getCampaignPublic: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ input }) => {
      const campaign = await prisma.campaign.findUnique({
        where: { id: input.id },
        include: {
          prizes: true,
          game: true,
          store: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              participants: true,
              prizes: true,
            },
          },
        },
      });

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campagne introuvable',
        });
      }

      return {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        isActive: campaign.isActive,
        storeName: campaign.store.name,
        maxParticipants: campaign.maxParticipants,
        googleReviewUrl: campaign.googleReviewUrl,
        prizes: campaign.prizes,
        game: campaign.game,
        _count: campaign._count,
      };
    }),
});
