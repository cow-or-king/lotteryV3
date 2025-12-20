/**
 * Condition Router
 * Routes tRPC pour la gestion de la progression des conditions
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { prisma } from '@/infrastructure/database/prisma-client';
import { TRPCError } from '@trpc/server';

export const conditionRouter = createTRPCRouter({
  /**
   * Récupère les conditions d'une campagne et la progression du participant
   */
  getProgress: publicProcedure
    .input(
      z.object({
        campaignId: z.string().cuid(),
        participantEmail: z.string().email(),
      }),
    )
    .query(async ({ input }) => {
      // Récupérer les conditions de la campagne avec le storeId
      const campaign = await prisma.campaign.findUnique({
        where: { id: input.campaignId },
        select: { storeId: true },
      });

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campagne introuvable',
        });
      }

      const conditions = await prisma.campaignCondition.findMany({
        where: { campaignId: input.campaignId },
        orderBy: { order: 'asc' },
      });

      if (conditions.length === 0) {
        return {
          conditions: [],
          participant: null,
          currentCondition: null,
          completedConditions: [],
          canPlay: false,
        };
      }

      // Récupérer les completions au niveau du store
      const storeCompletions = await prisma.storeConditionCompletion.findMany({
        where: {
          email: input.participantEmail,
          storeId: campaign.storeId,
        },
      });

      const completedAtStoreLevel = new Set(storeCompletions.map((sc) => sc.conditionType));

      // Récupérer ou créer le participant
      let participant = await prisma.participant.findUnique({
        where: {
          email_campaignId: {
            email: input.participantEmail,
            campaignId: input.campaignId,
          },
        },
      });

      if (!participant) {
        // Créer un nouveau participant
        participant = await prisma.participant.create({
          data: {
            email: input.participantEmail,
            campaignId: input.campaignId,
            completedConditions: [],
            currentConditionOrder: 0,
            hasPlayed: false,
          },
        });
      }

      let completedConditions = participant.completedConditions as string[];
      let currentOrder = participant.currentConditionOrder;

      // Auto-compléter TOUTES les conditions déjà complétées au niveau du store
      // Permet de sauter toutes les conditions déjà validées dans d'autres campagnes du même store
      let needsUpdate = false;
      for (const condition of conditions) {
        // Si la condition est au niveau store et pas encore complétée pour ce participant
        if (
          completedAtStoreLevel.has(condition.type) &&
          !completedConditions.includes(condition.id)
        ) {
          completedConditions = [...completedConditions, condition.id];
          needsUpdate = true;
        }
      }

      // Recalculer currentOrder après auto-complétion
      if (needsUpdate) {
        // Trouver la première condition non complétée
        let newOrder = 0;
        for (const condition of conditions) {
          if (completedConditions.includes(condition.id)) {
            newOrder = condition.order + 1;
          } else {
            break;
          }
        }
        currentOrder = newOrder;

        participant = await prisma.participant.update({
          where: { id: participant.id },
          data: {
            completedConditions,
            currentConditionOrder: currentOrder,
          },
        });
      }

      // Trouver la condition courante
      const currentCondition = conditions.find((c) => c.order === currentOrder) || null;

      // NOUVELLE LOGIQUE: Système "une condition par visite"
      // L'utilisateur peut jouer si:
      // 1. Il a complété au moins une condition QUI DONNE ACCÈS AU JEU (enablesGame = true)
      // 2. Il a complété plus de conditions "game-enabled" qu'il n'a joué
      // 3. Il n'a pas encore complété toutes les conditions OU il a joué moins que le nombre de conditions "game-enabled"

      const playCount = participant.playCount || 0;

      // Compter seulement les conditions qui donnent accès au jeu
      const gameEnabledConditions = conditions.filter((c) => c.enablesGame);
      const completedGameEnabledConditions = completedConditions.filter((condId) => {
        const cond = conditions.find((c) => c.id === condId);
        return cond?.enablesGame === true;
      });

      const conditionsCompletedCount = completedConditions.length;
      const gameEnabledCompletedCount = completedGameEnabledConditions.length;
      const allConditionsCompleted = currentOrder >= conditions.length;

      // Récupérer les conditions pour lesquelles le jeu a déjà été joué
      const playedConditions = (participant.playedConditions as string[]) || [];

      // NOUVEAU: Récupérer les types de conditions pour lesquelles un jeu a déjà été joué au niveau STORE
      const storePlayedGames = await prisma.$queryRaw<Array<{ condition_type: string }>>`
        SELECT condition_type
        FROM store_played_games
        WHERE email = ${input.participantEmail}
          AND store_id = ${campaign.storeId}
      `;
      const storePlayedTypes = new Set(storePlayedGames.map((g) => g.condition_type));

      // Peut jouer si: au moins une condition "game-enabled" complétée ET pas encore joué pour ce TYPE au niveau store
      const playableConditions = completedGameEnabledConditions.filter((conditionId) => {
        const condition = conditions.find((c) => c.id === conditionId);
        if (!condition) return false;

        // Vérifier si un jeu a déjà été joué pour ce TYPE de condition au niveau store
        return !storePlayedTypes.has(condition.type);
      });

      const canPlay = playableConditions.length > 0;
      const nextPlayableConditionId = playableConditions[0] || null;

      return {
        conditions,
        participant,
        currentCondition,
        completedConditions,
        canPlay,
        nextPlayableConditionId, // ID de la condition qui donne accès au jeu
      };
    }),

  /**
   * Marque une condition comme complétée
   */
  completeCondition: publicProcedure
    .input(
      z.object({
        campaignId: z.string().cuid(),
        participantEmail: z.string().email(),
        conditionId: z.string().cuid(),
      }),
    )
    .mutation(async ({ input }) => {
      // Récupérer la condition
      const condition = await prisma.campaignCondition.findUnique({
        where: { id: input.conditionId },
        include: {
          campaign: {
            select: { storeId: true },
          },
        },
      });

      if (!condition || condition.campaignId !== input.campaignId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Condition introuvable',
        });
      }

      // Récupérer le participant
      const participant = await prisma.participant.findUnique({
        where: {
          email_campaignId: {
            email: input.participantEmail,
            campaignId: input.campaignId,
          },
        },
      });

      if (!participant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Participant introuvable',
        });
      }

      const completedConditions = participant.completedConditions as string[];

      // Vérifier que la condition n'est pas déjà complétée
      if (completedConditions.includes(input.conditionId)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Condition déjà complétée',
        });
      }

      // Vérifier que c'est bien la condition courante
      if (condition.order !== participant.currentConditionOrder) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cette condition ne peut pas être complétée maintenant',
        });
      }

      // Mettre à jour le participant
      const updated = await prisma.participant.update({
        where: { id: participant.id },
        data: {
          completedConditions: [...completedConditions, input.conditionId],
          currentConditionOrder: participant.currentConditionOrder + 1,
        },
      });

      // Sauvegarder au niveau du store (upsert pour éviter les doublons)
      // Utiliser une requête SQL brute pour éviter les problèmes de type enum
      await prisma.$executeRaw`
        INSERT INTO store_condition_completions (id, email, store_id, condition_type, completed_at)
        VALUES (gen_random_uuid()::text, ${input.participantEmail}, ${condition.campaign.storeId}, ${condition.type}::"ConditionType", NOW())
        ON CONFLICT (email, store_id, condition_type)
        DO UPDATE SET completed_at = NOW()
      `;

      // Vérifier si la condition complétée donne accès au jeu
      const canPlay = condition.enablesGame === true;

      return {
        success: true,
        canPlay,
        enablesGame: condition.enablesGame,
        nextConditionOrder: updated.currentConditionOrder,
      };
    }),

  /**
   * Récupère une condition spécifique
   */
  getCondition: publicProcedure
    .input(
      z.object({
        conditionId: z.string().cuid(),
      }),
    )
    .query(async ({ input }) => {
      const condition = await prisma.campaignCondition.findUnique({
        where: { id: input.conditionId },
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              googleReviewUrl: true,
            },
          },
        },
      });

      if (!condition) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Condition introuvable',
        });
      }

      return condition;
    }),

  /**
   * Marque la condition GAME comme complétée
   * Cette mutation est appelée APRÈS l'affichage du prize
   */
  completeGameCondition: publicProcedure
    .input(
      z.object({
        campaignId: z.string().cuid(),
        participantEmail: z.string().email(),
      }),
    )
    .mutation(async ({ input }) => {
      // Récupérer la campagne et le store
      const campaign = await prisma.campaign.findUnique({
        where: { id: input.campaignId },
        select: {
          id: true,
          storeId: true,
        },
      });

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campagne introuvable',
        });
      }

      // Trouver la condition GAME de cette campagne
      const gameCondition = await prisma.campaignCondition.findFirst({
        where: {
          campaignId: input.campaignId,
          type: 'GAME',
        },
      });

      // Si pas de condition GAME, on ne fait rien (pas d'erreur)
      if (!gameCondition) {
        return { success: true, hasGameCondition: false };
      }

      // Récupérer le participant
      let participant = await prisma.participant.findUnique({
        where: {
          email_campaignId: {
            email: input.participantEmail,
            campaignId: input.campaignId,
          },
        },
      });

      if (!participant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Participant introuvable',
        });
      }

      const completedConditions = participant.completedConditions as string[];

      // Vérifier que la condition GAME n'est pas déjà complétée
      if (!completedConditions.includes(gameCondition.id)) {
        // Mettre à jour le participant
        await prisma.participant.update({
          where: { id: participant.id },
          data: {
            completedConditions: [...completedConditions, gameCondition.id],
            currentConditionOrder: participant.currentConditionOrder + 1,
          },
        });

        // Sauvegarder au niveau du store
        await prisma.$executeRaw`
          INSERT INTO store_condition_completions (id, email, store_id, condition_type, completed_at)
          VALUES (gen_random_uuid()::text, ${input.participantEmail}, ${campaign.storeId}, 'GAME'::"ConditionType", NOW())
          ON CONFLICT (email, store_id, condition_type)
          DO UPDATE SET completed_at = NOW()
        `;
      }

      return {
        success: true,
        hasGameCondition: true,
      };
    }),
});
