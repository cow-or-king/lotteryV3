/**
 * Game Public Router
 * Routes tRPC publiques pour les joueurs (sans auth)
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';
import { playGameSchema } from './game-schemas';
import { generateClaimCode, selectPrize } from './game-utils';

export const gamePublicRouter = createTRPCRouter({
  /**
   * Jouer au jeu d'une campagne (PUBLIC - sans auth)
   * Effectue un tirage au sort basé sur les probabilités des lots
   */
  play: publicProcedure.input(playGameSchema).mutation(async ({ input }) => {
    // Vérifier que la campagne existe et est active
    const campaign = await prisma.campaign.findUnique({
      where: { id: input.campaignId },
      include: {
        game: true, // IMPORTANT: charger le game avec sa config
        prizes: {
          where: {
            remaining: {
              gt: 0,
            },
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

    if (!campaign.isActive) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cette campagne n est pas active',
      });
    }

    // Vérifier si l'utilisateur a déjà joué
    const existingParticipation = await prisma.participant.findFirst({
      where: {
        campaignId: input.campaignId,
        email: input.playerEmail,
      },
    });

    if (existingParticipation) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Vous avez déjà participé à cette campagne',
      });
    }

    // Vérifier le nombre max de participants
    if (campaign.maxParticipants) {
      const participantCount = await prisma.participant.count({
        where: { campaignId: input.campaignId },
      });

      if (participantCount >= campaign.maxParticipants) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Le nombre maximum de participants a été atteint',
        });
      }
    }

    // Effectuer le tirage au sort
    const wonPrize = selectPrize(campaign.prizes);

    // Créer le participant
    const participant = await prisma.participant.create({
      data: {
        campaignId: input.campaignId,
        email: input.playerEmail,
        name: input.playerName,
        hasPlayed: true,
        playedAt: new Date(),
      },
    });

    // Générer le code de réclamation si un lot a été gagné
    let claimCode: string | null = null;

    if (wonPrize) {
      claimCode = generateClaimCode();

      // Calculer la date d'expiration (30 jours par défaut, ou prizeClaimExpiryDays de la campagne)
      const expiryDays = campaign.prizeClaimExpiryDays || 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      // Créer une entrée Winner
      await prisma.winner.create({
        data: {
          prizeId: wonPrize.id,
          participantEmail: input.playerEmail,
          participantName: input.playerName,
          claimCode,
          expiresAt,
          status: 'PENDING',
        },
      });

      // Décrémenter la quantité restante
      await prisma.prize.update({
        where: { id: wonPrize.id },
        data: {
          remaining: {
            decrement: 1,
          },
        },
      });
    }

    // Trouver le résultat gagnant pour forcer l'animation du jeu
    let winningSegmentId: string | null = null;
    let winningCombination: [string, string, string] | null = null;

    if (wonPrize && campaign.game?.config && campaign.prizes) {
      const gameConfig = campaign.game.config as {
        segments?: Array<{ id: string; label: string; prize?: { prizeIndex: number } }>;
        winningPatterns?: Array<{ symbols: [string, string, string]; prizeIndex: number }>;
      };

      // Pour la roue (WHEEL ou WHEEL_MINI)
      if (campaign.game.type === 'WHEEL' || campaign.game.type === 'WHEEL_MINI') {
        if (gameConfig.segments) {
          // Trouver l'INDEX du prize gagné dans la liste des prizes
          const prizeIndex = campaign.prizes.findIndex((p) => p.id === wonPrize.id);

          // Utiliser cet index pour trouver le segment correspondant
          // Les segments sont créés dans le même ordre que les prizes
          if (prizeIndex !== -1 && prizeIndex < gameConfig.segments.length) {
            winningSegmentId = gameConfig.segments[prizeIndex]!.id;
          }
        }
      }

      // Pour la slot machine
      if (campaign.game.type === 'SLOT_MACHINE') {
        if (gameConfig.winningPatterns && gameConfig.winningPatterns.length > 0) {
          // Trouver l'INDEX du prize gagné
          const prizeIndex = campaign.prizes.findIndex((p) => p.id === wonPrize.id);

          // Trouver tous les patterns pour ce prize
          const matchingPatterns = gameConfig.winningPatterns.filter(
            (pattern) => pattern.prizeIndex === prizeIndex,
          );

          if (matchingPatterns.length > 0) {
            // Choisir un pattern aléatoire parmi ceux disponibles pour ce prize
            const randomPattern =
              matchingPatterns[Math.floor(Math.random() * matchingPatterns.length)];
            if (randomPattern) {
              winningCombination = randomPattern.symbols;
            }
          }
        }
      }
    }

    // Retourner le résultat
    return {
      hasWon: wonPrize !== null,
      prize: wonPrize
        ? {
            id: wonPrize.id,
            name: wonPrize.name,
            description: wonPrize.description,
            value: wonPrize.value,
            color: wonPrize.color,
          }
        : null,
      participantId: participant.id,
      claimCode,
      winningSegmentId, // Pour la roue
      winningCombination, // Pour la slot machine
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
        prizes: campaign.prizes,
        game: campaign.game,
        _count: campaign._count,
      };
    }),
});
