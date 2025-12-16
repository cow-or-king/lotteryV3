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
  // Peut être un templateId (template-*) OU un gameId (cuid)
  gameId: z.string().optional(),
  templateId: z.string().optional(),
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
   * Suggère un template de jeu basé sur le nombre de lots
   * NE crée PAS le jeu dans la base de données (templates virtuels)
   */
  suggestGameTemplate: protectedProcedure
    .input(
      z.object({
        numberOfPrizes: z.number().int().min(1).max(50),
      }),
    )
    .query(async ({ input }) => {
      const { suggestGameTemplate } = await import('@/lib/constants/game-templates');
      const template = suggestGameTemplate(input.numberOfPrizes);

      return {
        templateId: template.id,
        name: template.name,
        description: template.description,
        type: template.type,
        previewImage: template.previewImage,
      };
    }),

  /**
   * Liste tous les templates de jeux disponibles
   */
  listGameTemplates: protectedProcedure.query(async () => {
    const { ALL_GAME_TEMPLATES } = await import('@/lib/constants/game-templates');

    return ALL_GAME_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      type: t.type,
      previewImage: t.previewImage,
      minPrizes: t.minPrizes,
      maxPrizes: t.maxPrizes,
    }));
  }),

  /**
   * Crée une nouvelle campagne avec les prizes
   */
  create: protectedProcedure.input(CreateCampaignSchema).mutation(async ({ input, ctx }) => {
    let finalGameId = input.gameId;

    // Si un templateId est fourni, créer le jeu depuis le template
    if (input.templateId) {
      const { getTemplateById, generateGameConfigFromTemplate } =
        await import('@/lib/constants/game-templates');
      const template = getTemplateById(input.templateId);

      if (!template) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Template de jeu introuvable',
        });
      }

      // Extraire les noms des prizes pour générer la config
      const prizeNames = input.prizes.map((p) => p.name);

      // Générer la config du jeu basée sur le template
      const gameConfig = generateGameConfigFromTemplate(template, prizeNames);

      // Debug: Vérifier que la config contient des segments
      console.log('📝 Game config generated:', JSON.stringify(gameConfig, null, 2));

      // Créer le jeu dans la base de données
      const game = await ctx.prisma.game.create({
        data: {
          name: `${input.name} - ${template.name}`,
          type: template.type,
          config: gameConfig, // Prisma s'occupe de la sérialisation JSON
          primaryColor: template.primaryColor,
          secondaryColor: template.secondaryColor,
          vibrationEnabled: true,
          isActive: true,
          createdBy: ctx.userId,
        },
      });

      console.log(
        '✅ Game created with id:',
        game.id,
        'config:',
        JSON.stringify(game.config, null, 2),
      );

      finalGameId = game.id;
    }

    const useCase = new CreateCampaignUseCase(campaignRepo, storeRepo, qrCodeRepo);

    const result = await useCase.execute({
      ...input,
      gameId: finalGameId,
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

    // Ajouter le nom du commerce et les infos QR Code à chaque campagne
    return campaigns.map((campaign) => {
      const store = stores.find((s) => s.id === campaign.storeId);

      // Récupérer le QR code par défaut du commerce si la campagne est active
      let qrCodeUrl: string | null = null;
      if (campaign.isActive && store?.defaultQrCodeId) {
        // On ne fait pas d'appel async ici pour ne pas ralentir, on renvoie juste l'ID
        // Le frontend pourra afficher le QR code via une route API
        qrCodeUrl = `/api/qr/${store.defaultQrCodeId}`;
      }

      return {
        ...campaign,
        storeName: store?.name || 'Commerce inconnu',
        qrCodeUrl,
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
