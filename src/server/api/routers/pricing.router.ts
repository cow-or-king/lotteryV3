/**
 * Pricing Router
 * Routes tRPC pour la gestion des plans tarifaires
 * IMPORTANT: ZERO any types
 * Architecture Hexagonale: Router → Use Cases → Repositories
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure, superAdminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Zod Schemas pour validation
const PricingFeatureSchema = z.object({
  text: z.string().min(1).max(200),
  isIncluded: z.boolean().default(true),
  isEmphasized: z.boolean().default(false),
  displayOrder: z.number().int().min(0),
});

const CreatePricingPlanSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().min(2).max(500),
  monthlyPrice: z.number().min(0).nullable(),
  annualPrice: z.number().min(0).nullable(),
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
  ctaText: z.string().min(1).max(50),
  ctaHref: z.string().min(1).max(200),
  badgeText: z.string().max(50).nullable(),
  features: z.array(PricingFeatureSchema),
});

const UpdatePricingPlanSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2).max(100).optional(),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().min(2).max(500).optional(),
  monthlyPrice: z.number().min(0).nullable().optional(),
  annualPrice: z.number().min(0).nullable().optional(),
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/)
    .optional(),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  ctaText: z.string().min(1).max(50).optional(),
  ctaHref: z.string().min(1).max(200).optional(),
  badgeText: z.string().max(50).nullable().optional(),
  features: z.array(PricingFeatureSchema).optional(),
});

export const pricingRouter = createTRPCRouter({
  /**
   * PUBLIC PROCEDURES
   */

  /**
   * Liste tous les plans tarifaires actifs
   * Retourne les plans triés par displayOrder
   */
  list: publicProcedure.query(async ({ ctx }) => {
    const plans = await ctx.prisma.pricingPlan.findMany({
      where: {
        isActive: true,
      },
      include: {
        features: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return plans;
  }),

  /**
   * Récupère un plan tarifaire par son slug
   * Version publique pour les landing pages
   */
  getBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const plan = await ctx.prisma.pricingPlan.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          features: {
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      });

      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plan tarifaire introuvable',
        });
      }

      // Vérifier que le plan est actif
      if (!plan.isActive) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "Ce plan tarifaire n'est pas actif",
        });
      }

      return plan;
    }),

  /**
   * PROTECTED PROCEDURES (SUPER_ADMIN only)
   */

  /**
   * Liste tous les plans tarifaires (y compris inactifs)
   * Accessible uniquement par les super-admins
   */
  getAll: superAdminProcedure.query(async ({ ctx }) => {
    const plans = await ctx.prisma.pricingPlan.findMany({
      include: {
        features: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return plans;
  }),

  /**
   * Crée un nouveau plan tarifaire
   * Accessible uniquement par les super-admins
   */
  create: superAdminProcedure.input(CreatePricingPlanSchema).mutation(async ({ input, ctx }) => {
    // Vérifier que le slug n'existe pas déjà
    const existingPlan = await ctx.prisma.pricingPlan.findUnique({
      where: {
        slug: input.slug,
      },
    });

    if (existingPlan) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Un plan tarifaire avec ce slug existe déjà',
      });
    }

    // Créer le plan avec ses fonctionnalités
    const plan = await ctx.prisma.pricingPlan.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        monthlyPrice: input.monthlyPrice,
        annualPrice: input.annualPrice,
        currency: input.currency,
        isActive: input.isActive,
        isPopular: input.isPopular,
        displayOrder: input.displayOrder,
        ctaText: input.ctaText,
        ctaHref: input.ctaHref,
        badgeText: input.badgeText,
        features: {
          create: input.features.map((feature) => ({
            text: feature.text,
            isIncluded: feature.isIncluded,
            isEmphasized: feature.isEmphasized,
            displayOrder: feature.displayOrder,
          })),
        },
      },
      include: {
        features: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    return plan;
  }),

  /**
   * Met à jour un plan tarifaire existant
   * Accessible uniquement par les super-admins
   */
  update: superAdminProcedure.input(UpdatePricingPlanSchema).mutation(async ({ input, ctx }) => {
    const { id, features, ...updateData } = input;

    // Vérifier que le plan existe
    const existingPlan = await ctx.prisma.pricingPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Plan tarifaire introuvable',
      });
    }

    // Si le slug change, vérifier qu'il n'est pas déjà utilisé
    if (updateData.slug && updateData.slug !== existingPlan.slug) {
      const slugExists = await ctx.prisma.pricingPlan.findUnique({
        where: {
          slug: updateData.slug,
        },
      });

      if (slugExists) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Un plan tarifaire avec ce slug existe déjà',
        });
      }
    }

    // Mettre à jour le plan
    const plan = await ctx.prisma.pricingPlan.update({
      where: { id },
      data: {
        ...updateData,
        ...(features && {
          features: {
            deleteMany: {}, // Supprimer toutes les anciennes features
            create: features.map((feature) => ({
              text: feature.text,
              isIncluded: feature.isIncluded,
              isEmphasized: feature.isEmphasized,
              displayOrder: feature.displayOrder,
            })),
          },
        }),
      },
      include: {
        features: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    return plan;
  }),

  /**
   * Supprime un plan tarifaire
   * Accessible uniquement par les super-admins
   */
  delete: superAdminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Vérifier que le plan existe
      const existingPlan = await ctx.prisma.pricingPlan.findUnique({
        where: { id: input.id },
      });

      if (!existingPlan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plan tarifaire introuvable',
        });
      }

      // Supprimer le plan (les features seront supprimées en cascade)
      await ctx.prisma.pricingPlan.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Met à jour l'ordre d'affichage des plans
   * Accessible uniquement par les super-admins
   */
  updateDisplayOrder: superAdminProcedure
    .input(
      z.object({
        planOrders: z.array(
          z.object({
            id: z.string().cuid(),
            displayOrder: z.number().int().min(0),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Mettre à jour l'ordre de chaque plan
      await Promise.all(
        input.planOrders.map((planOrder) =>
          ctx.prisma.pricingPlan.update({
            where: { id: planOrder.id },
            data: { displayOrder: planOrder.displayOrder },
          }),
        ),
      );

      return { success: true };
    }),

  /**
   * Active/désactive un plan tarifaire
   * Accessible uniquement par les super-admins
   */
  toggleActive: superAdminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Vérifier que le plan existe
      const existingPlan = await ctx.prisma.pricingPlan.findUnique({
        where: { id: input.id },
      });

      if (!existingPlan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plan tarifaire introuvable',
        });
      }

      // Mettre à jour le statut
      const plan = await ctx.prisma.pricingPlan.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });

      return plan;
    }),
});
