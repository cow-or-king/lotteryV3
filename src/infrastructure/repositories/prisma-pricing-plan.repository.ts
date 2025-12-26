/**
 * Prisma PricingPlan Repository Adapter
 * Implémentation Prisma du port PricingPlanRepository
 * Architecture hexagonale: Adapter dans l'infrastructure
 * IMPORTANT: ZERO any types
 */

import { prisma } from '@/infrastructure/database/prisma-client';
import type {
  PricingPlanRepository,
  PricingPlanEntity,
  CreatePricingPlanProps,
  UpdatePricingPlanProps,
} from '@/core/ports/pricing-plan.repository';
import type { PricingPlanProps, PricingFeature } from '@/core/entities/pricing-plan.entity';
import { PricingPlanEntity as PricingPlanEntityClass } from '@/core/entities/pricing-plan.entity';
import type { Result } from '@/lib/types/result.type';
import { ok, fail } from '@/lib/types/result.type';
import type { PricingPlanId, PricingFeatureId } from '@/lib/types/branded.type';
import type { PricingPlan, PricingFeature as PrismaPricingFeature } from '@/generated/prisma';

/**
 * Type for Prisma PricingPlan with features included
 */
type PrismaPricingPlanWithFeatures = PricingPlan & {
  features: PrismaPricingFeature[];
};

/**
 * Converts a Prisma PricingFeature to domain PricingFeature
 */
function prismaFeatureToDomain(prismaFeature: PrismaPricingFeature): PricingFeature {
  return {
    id: prismaFeature.id as PricingFeatureId,
    text: prismaFeature.text,
    isIncluded: prismaFeature.isIncluded,
    isEmphasized: prismaFeature.isEmphasized,
    displayOrder: prismaFeature.displayOrder,
  };
}

/**
 * Converts a Prisma PricingPlan (with features) to domain entity
 */
function prismaToDomain(prismaPlan: PrismaPricingPlanWithFeatures): PricingPlanEntity {
  const props: PricingPlanProps = {
    id: prismaPlan.id as PricingPlanId,
    name: prismaPlan.name,
    slug: prismaPlan.slug,
    description: prismaPlan.description,
    monthlyPrice: prismaPlan.monthlyPrice,
    annualPrice: prismaPlan.annualPrice,
    currency: prismaPlan.currency,
    isActive: prismaPlan.isActive,
    isPopular: prismaPlan.isPopular,
    displayOrder: prismaPlan.displayOrder,
    ctaText: prismaPlan.ctaText,
    ctaHref: prismaPlan.ctaHref,
    badgeText: prismaPlan.badgeText,
    features: prismaPlan.features.map(prismaFeatureToDomain),
    createdAt: prismaPlan.createdAt,
    updatedAt: prismaPlan.updatedAt,
  };

  return PricingPlanEntityClass.fromPersistence(props);
}

export class PrismaPricingPlanRepository implements PricingPlanRepository {
  async findAll(): Promise<Result<PricingPlanEntity[]>> {
    try {
      const plans = await prisma.pricingPlan.findMany({
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

      const entities = plans.map(prismaToDomain);
      return ok(entities);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to find all pricing plans'));
    }
  }

  async findById(id: PricingPlanId): Promise<Result<PricingPlanEntity | null>> {
    try {
      const plan = await prisma.pricingPlan.findUnique({
        where: { id: id as string },
        include: {
          features: {
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      });

      if (!plan) {
        return ok(null);
      }

      const entity = prismaToDomain(plan);
      return ok(entity);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to find pricing plan by id'));
    }
  }

  async findBySlug(slug: string): Promise<Result<PricingPlanEntity | null>> {
    try {
      const plan = await prisma.pricingPlan.findUnique({
        where: { slug },
        include: {
          features: {
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      });

      if (!plan) {
        return ok(null);
      }

      const entity = prismaToDomain(plan);
      return ok(entity);
    } catch (error) {
      return fail(
        error instanceof Error ? error : new Error('Failed to find pricing plan by slug'),
      );
    }
  }

  async findAllActive(): Promise<Result<PricingPlanEntity[]>> {
    try {
      const plans = await prisma.pricingPlan.findMany({
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

      const entities = plans.map(prismaToDomain);
      return ok(entities);
    } catch (error) {
      return fail(
        error instanceof Error ? error : new Error('Failed to find active pricing plans'),
      );
    }
  }

  async create(props: CreatePricingPlanProps): Promise<Result<PricingPlanEntity>> {
    try {
      // Create the entity first for validation
      const entityResult = PricingPlanEntityClass.create(props);
      if (!entityResult.success) {
        return fail(entityResult.error);
      }

      const entity = entityResult.data;
      const persistence = entity.toPersistence();

      // Create in database
      const plan = await prisma.pricingPlan.create({
        data: {
          name: persistence.name,
          slug: persistence.slug,
          description: persistence.description,
          monthlyPrice: persistence.monthlyPrice,
          annualPrice: persistence.annualPrice,
          currency: persistence.currency,
          isActive: persistence.isActive,
          isPopular: persistence.isPopular,
          displayOrder: persistence.displayOrder,
          ctaText: persistence.ctaText,
          ctaHref: persistence.ctaHref,
          badgeText: persistence.badgeText,
        },
        include: {
          features: {
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      });

      const createdEntity = prismaToDomain(plan);
      return ok(createdEntity);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to create pricing plan'));
    }
  }

  async update(
    id: PricingPlanId,
    props: UpdatePricingPlanProps,
  ): Promise<Result<PricingPlanEntity>> {
    try {
      // First, fetch the existing plan
      const existingResult = await this.findById(id);
      if (!existingResult.success) {
        return fail(existingResult.error);
      }

      if (!existingResult.data) {
        return fail(new Error('Pricing plan not found'));
      }

      // Update the entity for validation
      const updateResult = existingResult.data.update(props);
      if (!updateResult.success) {
        return fail(updateResult.error);
      }

      const updatedEntity = updateResult.data;
      const persistence = updatedEntity.toPersistence();

      // Update in database
      const plan = await prisma.pricingPlan.update({
        where: { id: id as string },
        data: {
          name: persistence.name,
          slug: persistence.slug,
          description: persistence.description,
          monthlyPrice: persistence.monthlyPrice,
          annualPrice: persistence.annualPrice,
          currency: persistence.currency,
          isActive: persistence.isActive,
          isPopular: persistence.isPopular,
          displayOrder: persistence.displayOrder,
          ctaText: persistence.ctaText,
          ctaHref: persistence.ctaHref,
          badgeText: persistence.badgeText,
        },
        include: {
          features: {
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      });

      const resultEntity = prismaToDomain(plan);
      return ok(resultEntity);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to update pricing plan'));
    }
  }

  async delete(id: PricingPlanId): Promise<Result<void>> {
    try {
      // Prisma cascade delete handles the features automatically
      await prisma.pricingPlan.delete({
        where: { id: id as string },
      });

      return ok(undefined);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to delete pricing plan'));
    }
  }

  async updateDisplayOrder(id: PricingPlanId, order: number): Promise<Result<void>> {
    try {
      await prisma.pricingPlan.update({
        where: { id: id as string },
        data: {
          displayOrder: order,
        },
      });

      return ok(undefined);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to update display order'));
    }
  }
}
