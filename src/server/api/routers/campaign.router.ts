/**
 * Campaign Router
 * Routes tRPC pour la gestion des campagnes
 * IMPORTANT: ZERO any types
 * Architecture Hexagonale: Router → Use Cases → Repositories
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { CreateCampaignUseCase } from '@/core/use-cases/campaign/create-campaign.use-case';
import { SuggestGameUseCase } from '@/core/use-cases/campaign/suggest-game.use-case';
import { PrismaCampaignRepository } from '@/infrastructure/repositories/prisma-campaign.repository';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma-store.repository';
import { PrismaQRCodeRepository } from '@/infrastructure/repositories/prisma-qrcode.repository';
import { TRPCError } from '@trpc/server';

// Schemas Zod pour validation
const PrizeConfigSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  value: z.number().min(0).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  probability: z.number().min(0).max(100),
  quantity: z.number().int().min(1),
});

const CreateCampaignSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  storeId: z.string().cuid(),
  isActive: z.boolean().optional().default(false),
  prizes: z.array(PrizeConfigSchema).min(1).max(50),
  gameId: z.string().cuid().optional(),
  maxParticipants: z.number().int().min(1).max(1000000).optional(),
  prizeClaimExpiryDays: z.number().int().min(1).max(365).optional(),
  requireReview: z.boolean().optional(),
  requireInstagram: z.boolean().optional(),
});

// Repository instances
const campaignRepo = new PrismaCampaignRepository();
const storeRepo = new PrismaStoreRepository();
const qrCodeRepo = new PrismaQRCodeRepository();

export const campaignRouter = createTRPCRouter({
  /**
   * Suggère un type de jeu basé sur le nombre de lots
   * ET crée le jeu dans la base de données
   */
  suggestGame: protectedProcedure
    .input(
      z.object({
        numberOfPrizes: z.number().int().min(1).max(50),
        prizeNames: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const useCase = new SuggestGameUseCase();
      const result = await useCase.execute({
        numberOfPrizes: input.numberOfPrizes,
      });

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error.message,
        });
      }

      const suggestion = result.data;

      // Créer le jeu dans la base de données avec la configuration appropriée
      const gameType = suggestion.primarySuggestion;
      const gameName = `Jeu auto-généré (${gameType})`;

      // Générer la configuration du jeu selon le type
      let gameConfig: Record<string, unknown> = {};

      if (gameType === 'WHEEL' || gameType === 'WHEEL_MINI') {
        // Configuration pour roue
        const segmentCount = input.numberOfPrizes;
        const colors = [
          '#8B5CF6',
          '#EC4899',
          '#F59E0B',
          '#10B981',
          '#3B82F6',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
        ];

        // Calculer les probabilités pour que la somme fasse exactement 100
        const baseProbability = Math.floor(100 / segmentCount);
        const remainder = 100 - baseProbability * segmentCount;

        const segments = Array.from({ length: segmentCount }, (_, i) => ({
          id: `segment-${i + 1}`,
          label: input.prizeNames?.[i] || `Lot ${i + 1}`,
          color: colors[i % colors.length],
          // Ajouter le reste au premier segment pour atteindre exactement 100%
          probability: i === 0 ? baseProbability + remainder : baseProbability,
          prize: {
            type: 'PRIZE' as const,
            value: input.prizeNames?.[i] || `Lot ${i + 1}`,
          },
        }));

        gameConfig = {
          segments,
          spinDuration: 3000,
          pointerPosition: 'top',
        };
      } else if (gameType === 'SLOT_MACHINE') {
        // Configuration pour machine à sous
        gameConfig = {
          reelsCount: 3,
          symbolsPerReel: 10,
          symbols: [
            { id: 'cherry', icon: '🍒', value: 10, color: '#EF4444' },
            { id: 'lemon', icon: '🍋', value: 15, color: '#FBBF24' },
            { id: 'orange', icon: '🍊', value: 20, color: '#F97316' },
            { id: 'star', icon: '⭐', value: 50, color: '#FBBF24' },
            { id: 'seven', icon: '7️⃣', value: 100, color: '#DC2626' },
          ],
          spinDuration: 2000,
          spinEasing: 'EASE_OUT',
        };
      } else {
        // Configuration par défaut pour autres types
        gameConfig = {
          numberOfPrizes: input.numberOfPrizes,
          mode: 'default',
        };
      }

      // Créer le jeu dans la base de données
      const game = await ctx.prisma.game.create({
        data: {
          name: gameName,
          type: gameType,
          config: gameConfig as Parameters<typeof ctx.prisma.game.create>[0]['data']['config'],
          primaryColor: '#8B5CF6',
          secondaryColor: '#EC4899',
          vibrationEnabled: true,
          isActive: true,
          createdBy: ctx.userId,
        },
      });

      return {
        gameId: game.id,
        name: gameName,
        type: gameType,
        reason: suggestion.reason,
        alternatives: suggestion.alternativeSuggestions,
      };
    }),

  /**
   * Crée une nouvelle campagne avec les prizes
   */
  create: protectedProcedure.input(CreateCampaignSchema).mutation(async ({ input, ctx }) => {
    const useCase = new CreateCampaignUseCase(campaignRepo, storeRepo, qrCodeRepo);

    const result = await useCase.execute({
      ...input,
      userId: ctx.userId,
    });

    if (!result.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: result.error.message,
      });
    }

    return result.data;
  }),

  /**
   * Récupère une campagne par ID avec ses prizes
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const campaign = await campaignRepo.getById(input.id);

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campagne introuvable',
        });
      }

      // Vérifier que l'utilisateur a accès à cette campagne
      const hasAccess = await storeRepo.verifyOwnership(campaign.storeId, ctx.userId);
      if (!hasAccess) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'avez pas accès à cette campagne",
        });
      }

      return campaign;
    }),

  /**
   * Liste toutes les campagnes d'un commerce
   */
  listByStore: protectedProcedure
    .input(
      z.object({
        storeId: z.string().cuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Vérifier que l'utilisateur a accès à ce commerce
      const hasAccess = await storeRepo.verifyOwnership(input.storeId, ctx.userId);
      if (!hasAccess) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'avez pas accès à ce commerce",
        });
      }

      return await campaignRepo.listByStore(input.storeId);
    }),

  /**
   * Liste toutes les campagnes de tous les commerces de l'utilisateur
   */
  listAll: protectedProcedure.query(async ({ ctx }) => {
    // Récupérer tous les commerces de l'utilisateur
    const stores = await storeRepo.listByUser(ctx.userId);
    const storeIds = stores.map((store) => store.id);

    if (storeIds.length === 0) {
      return [];
    }

    // Récupérer toutes les campagnes
    const campaigns = await campaignRepo.listAll(storeIds);

    // Ajouter le nom du commerce à chaque campagne
    return campaigns.map((campaign) => {
      const store = stores.find((s) => s.id === campaign.storeId);
      return {
        ...campaign,
        storeName: store?.name || 'Commerce inconnu',
      };
    });
  }),

  /**
   * Active/désactive une campagne
   * Si on active une campagne, désactive automatiquement les autres campagnes du même commerce
   */
  toggleStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Récupérer la campagne pour vérifier l'accès
      const campaign = await campaignRepo.getById(input.id);

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campagne introuvable',
        });
      }

      // Vérifier que l'utilisateur a accès à ce commerce
      const hasAccess = await storeRepo.verifyOwnership(campaign.storeId, ctx.userId);
      if (!hasAccess) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'avez pas accès à cette campagne",
        });
      }

      // Si on active la campagne
      if (input.isActive) {
        // Désactiver toutes les autres campagnes de ce commerce
        await campaignRepo.deactivateOtherCampaigns(campaign.storeId, input.id);

        // Activer la campagne
        await campaignRepo.activateCampaign(input.id);

        // Mettre à jour le QR Code par défaut du commerce
        const store = await storeRepo.getById(campaign.storeId);
        if (store?.defaultQrCodeId) {
          try {
            await qrCodeRepo.updateCampaignUrl(store.defaultQrCodeId, input.id);
          } catch (error) {
            console.error('Erreur lors de la mise à jour du QR Code:', error);
          }
        }
      } else {
        // Désactiver la campagne
        await campaignRepo.deactivateCampaign(input.id);
      }

      return { success: true };
    }),

  /**
   * Supprime une campagne
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Récupérer la campagne pour vérifier l'accès
      const campaign = await campaignRepo.getById(input.id);

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campagne introuvable',
        });
      }

      // Vérifier que l'utilisateur a accès à ce commerce
      const hasAccess = await storeRepo.verifyOwnership(campaign.storeId, ctx.userId);
      if (!hasAccess) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'avez pas accès à cette campagne",
        });
      }

      await campaignRepo.delete(input.id);

      return { success: true };
    }),
});
