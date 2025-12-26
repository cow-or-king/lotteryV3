/**
 * Pricing Router
 * Routes tRPC pour la gestion des plans tarifaires
 * IMPORTANT: ZERO any types
 * Architecture Hexagonale: Router → Use Cases → Repositories
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure, superAdminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Import Use Cases
import { ListPricingPlansUseCase } from '@/core/use-cases/pricing/list-pricing-plans.use-case';
import { GetPricingPlanBySlugUseCase } from '@/core/use-cases/pricing/get-pricing-plan-by-slug.use-case';
import { CreatePricingPlanUseCase } from '@/core/use-cases/pricing/create-pricing-plan.use-case';
import { UpdatePricingPlanUseCase } from '@/core/use-cases/pricing/update-pricing-plan.use-case';
import { DeletePricingPlanUseCase } from '@/core/use-cases/pricing/delete-pricing-plan.use-case';
import { TogglePricingPlanActiveUseCase } from '@/core/use-cases/pricing/toggle-pricing-plan-active.use-case';

// Import Repository
import { PrismaPricingPlanRepository } from '@/infrastructure/repositories/prisma-pricing-plan.repository';

// Import branded types
import type { PricingPlanId } from '@/lib/types/branded.type';

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
  list: publicProcedure.query(async () => {
    const pricingPlanRepo = new PrismaPricingPlanRepository();
    const useCase = new ListPricingPlansUseCase(pricingPlanRepo);

    const result = await useCase.execute({});

    if (!result.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: result.error.message,
      });
    }

    return result.data.plans;
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
    .query(async ({ input }) => {
      const pricingPlanRepo = new PrismaPricingPlanRepository();
      const useCase = new GetPricingPlanBySlugUseCase(pricingPlanRepo);

      const result = await useCase.execute({ slug: input.slug });

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return result.data.plan;
    }),

  /**
   * PROTECTED PROCEDURES (SUPER_ADMIN only)
   */

  /**
   * Liste tous les plans tarifaires (y compris inactifs)
   * Accessible uniquement par les super-admins
   */
  getAll: superAdminProcedure.query(async () => {
    const pricingPlanRepo = new PrismaPricingPlanRepository();

    const result = await pricingPlanRepo.findAll();

    if (!result.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: result.error.message,
      });
    }

    return result.data;
  }),

  /**
   * Crée un nouveau plan tarifaire
   * Accessible uniquement par les super-admins
   */
  create: superAdminProcedure.input(CreatePricingPlanSchema).mutation(async ({ input }) => {
    const pricingPlanRepo = new PrismaPricingPlanRepository();
    const useCase = new CreatePricingPlanUseCase(pricingPlanRepo);

    const result = await useCase.execute(input);

    if (!result.success) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: result.error.message,
      });
    }

    return result.data.plan;
  }),

  /**
   * Met à jour un plan tarifaire existant
   * Accessible uniquement par les super-admins
   */
  update: superAdminProcedure.input(UpdatePricingPlanSchema).mutation(async ({ input }) => {
    const pricingPlanRepo = new PrismaPricingPlanRepository();
    const useCase = new UpdatePricingPlanUseCase(pricingPlanRepo);

    const { id, ...updateData } = input;
    const result = await useCase.execute({
      id: id as PricingPlanId,
      ...updateData,
    });

    if (!result.success) {
      const errorMessage = result.error.message;
      // Determine appropriate error code based on error message
      const code = errorMessage.includes('introuvable')
        ? 'NOT_FOUND'
        : errorMessage.includes('existe déjà')
          ? 'CONFLICT'
          : 'BAD_REQUEST';

      throw new TRPCError({
        code,
        message: errorMessage,
      });
    }

    return result.data.plan;
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
    .mutation(async ({ input }) => {
      const pricingPlanRepo = new PrismaPricingPlanRepository();
      const useCase = new DeletePricingPlanUseCase(pricingPlanRepo);

      const result = await useCase.execute({ id: input.id as PricingPlanId });

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return result.data;
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
    .mutation(async ({ input }) => {
      const pricingPlanRepo = new PrismaPricingPlanRepository();

      // Update display order for each plan using repository method
      const updatePromises = input.planOrders.map((planOrder) =>
        pricingPlanRepo.updateDisplayOrder(planOrder.id as PricingPlanId, planOrder.displayOrder),
      );

      const results = await Promise.all(updatePromises);

      // Check if any update failed
      const failedResult = results.find((result) => !result.success);
      if (failedResult) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: failedResult.error.message,
        });
      }

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
    .mutation(async ({ input }) => {
      const pricingPlanRepo = new PrismaPricingPlanRepository();
      const useCase = new TogglePricingPlanActiveUseCase(pricingPlanRepo);

      const result = await useCase.execute({
        id: input.id as PricingPlanId,
        isActive: input.isActive,
      });

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return result.data.plan;
    }),
});
