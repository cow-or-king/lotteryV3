/**
 * Campaign Router
 * Routes tRPC pour la gestion des campagnes
 * IMPORTANT: ZERO any types
 * Architecture Hexagonale: Router → Use Cases → Repositories
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { CreateCampaignUseCase } from '@/core/use-cases/campaign/create-campaign.use-case';
import { PrismaCampaignRepository } from '@/infrastructure/repositories/prisma-campaign.repository';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma-store.repository';
import { PrismaQRCodeRepository } from '@/infrastructure/repositories/prisma-qrcode.repository';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@/generated/prisma';

// Schemas Zod pour validation
const PrizeConfigSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  value: z.number().min(0).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  probability: z.number().min(0).max(100),
  quantity: z.number().int().min(1),
});

const ConditionConfigSchema = z.object({
  id: z.string(),
  type: z.enum([
    'GOOGLE_REVIEW',
    'INSTAGRAM_FOLLOW',
    'TIKTOK_FOLLOW',
    'NEWSLETTER',
    'LOYALTY_PROGRAM',
    'CUSTOM_REDIRECT',
    'GAME',
  ]),
  title: z.string(),
  description: z.string(),
  iconEmoji: z.string(),
  config: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .nullable()
    .optional(),
  enablesGame: z.boolean().optional().default(true),
});

const CreateCampaignSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  storeId: z.string().cuid(),
  isActive: z.boolean().optional().default(false),
  prizes: z.array(PrizeConfigSchema).min(1).max(50),
  conditions: z.array(ConditionConfigSchema).optional().default([]),
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

      // Créer le jeu dans la base de données
      const game = await ctx.prisma.game.create({
        data: {
          name: `${input.name} - ${template.name}`,
          type: template.type as 'WHEEL' | 'WHEEL_MINI' | 'SLOT_MACHINE',
          config: gameConfig as Prisma.InputJsonValue,
          primaryColor: template.primaryColor,
          secondaryColor: template.secondaryColor,
          vibrationEnabled: true,
          isActive: true,
          createdBy: ctx.userId,
        },
      });

      finalGameId = game.id;
    }

    const useCase = new CreateCampaignUseCase(campaignRepo, storeRepo, qrCodeRepo);

    const result = await useCase.execute({
      ...input,
      gameId: finalGameId,
      userId: ctx.userId,
      // Transform conditions to ensure config is null instead of undefined
      conditions: input.conditions?.map((c) => ({
        ...c,
        config: c.config ?? null,
      })),
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
   * Récupère une campagne par ID - version publique pour les landing pages
   * Ne requiert pas d'authentification et ne retourne que les campagnes actives
   */
  getByIdPublic: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ input }) => {
      const campaign = await campaignRepo.getById(input.id);

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campagne introuvable',
        });
      }

      // Vérifier que la campagne est active
      if (!campaign.isActive) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "Cette campagne n'est pas active",
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

    // Récupérer tous les QR codes par défaut des stores en une seule requête
    const qrCodeIds = stores
      .filter((s) => s.defaultQrCodeId)
      .map((s) => s.defaultQrCodeId) as string[];

    const qrCodes = await ctx.prisma.qRCode.findMany({
      where: { id: { in: qrCodeIds } },
      select: { id: true, shortCode: true },
    });

    // Créer un map pour un accès rapide
    const qrCodeMap = new Map(qrCodes.map((qr) => [qr.id, qr.shortCode]));

    // Ajouter le nom du commerce et le shortCode du QR Code à chaque campagne
    return campaigns.map((campaign) => {
      const store = stores.find((s) => s.id === campaign.storeId);

      // Récupérer le shortCode du QR code si la campagne est active
      let qrCodeUrl: string | null = null;
      let qrCodeShortCode: string | null = null;
      if (campaign.isActive && store?.defaultQrCodeId) {
        qrCodeShortCode = qrCodeMap.get(store.defaultQrCodeId) || null;
        if (qrCodeShortCode) {
          qrCodeUrl = `/c/${qrCodeShortCode}`;
        }
      }

      return {
        ...campaign,
        storeName: store?.name || 'Commerce inconnu',
        qrCodeUrl,
        qrCodeShortCode, // Ajouter le shortCode pour le bouton "Tester"
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
          } catch (_error) {
            // Error updating QR Code, continue
          }
        }
      } else {
        // Désactiver la campagne
        await campaignRepo.deactivateCampaign(input.id);
      }

      return { success: true };
    }),

  /**
   * Met à jour une campagne
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(2).max(200).optional(),
        description: z.string().optional(),
        maxParticipants: z.number().int().min(1).max(1000000).optional().nullable(),
        minDaysBetweenPlays: z.number().int().min(1).max(365).optional().nullable(),
        prizeClaimExpiryDays: z.number().int().min(1).max(365).optional(),
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

      // Construire l'objet de mise à jour
      const updateData: {
        name?: string;
        description?: string;
        maxParticipants?: number | null;
        minDaysBetweenPlays?: number | null;
        prizeClaimExpiryDays?: number;
      } = {};

      if (input.name !== undefined) {
        updateData.name = input.name;
      }
      if (input.description !== undefined) {
        updateData.description = input.description;
      }
      if (input.maxParticipants !== undefined) {
        updateData.maxParticipants = input.maxParticipants;
      }
      if (input.minDaysBetweenPlays !== undefined) {
        updateData.minDaysBetweenPlays = input.minDaysBetweenPlays;
      }
      if (input.prizeClaimExpiryDays !== undefined) {
        updateData.prizeClaimExpiryDays = input.prizeClaimExpiryDays;
      }

      // Mettre à jour la campagne
      await ctx.prisma.campaign.update({
        where: { id: input.id },
        data: updateData,
      });

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
