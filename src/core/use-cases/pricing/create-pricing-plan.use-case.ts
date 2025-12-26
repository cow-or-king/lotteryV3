/**
 * CreatePricingPlan Use Case
 * Creates a new pricing plan with features
 * IMPORTANT: ZERO any types, Result Pattern
 * Architecture Hexagonale: Use Case ne dépend PAS de l'infrastructure
 */

import type { Result } from '@/lib/types/result.type';
import { ok, fail } from '@/lib/types/result.type';
import type { PricingPlanRepository } from '@/core/ports/pricing-plan.repository';
import type { PricingPlanEntity } from '@/core/entities/pricing-plan.entity';
import type { PricingFeatureInput } from './types';

export type { PricingFeatureInput };

export interface CreatePricingPlanInput {
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  currency: string;
  isActive: boolean;
  isPopular: boolean;
  displayOrder: number;
  ctaText: string;
  ctaHref: string;
  badgeText: string | null;
  features: PricingFeatureInput[];
}

export interface CreatePricingPlanOutput {
  plan: PricingPlanEntity;
}

/**
 * Validates that the slug is unique
 */
async function checkSlugUniqueness(
  repository: PricingPlanRepository,
  slug: string,
): Promise<Result<void>> {
  const existingPlanResult = await repository.findBySlug(slug);

  if (!existingPlanResult.success) {
    return fail(existingPlanResult.error);
  }

  if (existingPlanResult.data !== null) {
    return fail(new Error('Un plan tarifaire avec ce slug existe déjà'));
  }

  return ok(undefined);
}

export class CreatePricingPlanUseCase {
  constructor(private readonly pricingPlanRepository: PricingPlanRepository) {}

  async execute(input: CreatePricingPlanInput): Promise<Result<CreatePricingPlanOutput>> {
    // 1. Check slug uniqueness
    const slugCheckResult = await checkSlugUniqueness(this.pricingPlanRepository, input.slug);
    if (!slugCheckResult.success) {
      return fail(slugCheckResult.error);
    }

    // 2. Create plan via repository (entity validation happens in repository)
    const createResult = await this.pricingPlanRepository.create({
      name: input.name,
      slug: input.slug,
      description: input.description,
      monthlyPrice: input.monthlyPrice ?? undefined,
      annualPrice: input.annualPrice ?? undefined,
      currency: input.currency,
      isActive: input.isActive,
      isPopular: input.isPopular,
      displayOrder: input.displayOrder,
      ctaText: input.ctaText,
      ctaHref: input.ctaHref,
      badgeText: input.badgeText ?? undefined,
    });

    if (!createResult.success) {
      return fail(createResult.error);
    }

    return ok({
      plan: createResult.data,
    });
  }
}
