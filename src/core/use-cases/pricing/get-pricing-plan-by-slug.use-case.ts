/**
 * GetPricingPlanBySlug Use Case
 * Retrieves a pricing plan by its slug (only active plans)
 * IMPORTANT: ZERO any types, Result Pattern
 * Architecture Hexagonale: Use Case ne dépend PAS de l'infrastructure
 */

import type { Result } from '@/lib/types/result.type';
import { ok, fail } from '@/lib/types/result.type';
import type { PricingPlanRepository } from '@/core/ports/pricing-plan.repository';
import type { PricingPlanEntity } from '@/core/entities/pricing-plan.entity';

export interface GetPricingPlanBySlugInput {
  slug: string;
}

export interface GetPricingPlanBySlugOutput {
  plan: PricingPlanEntity;
}

/**
 * Validates slug format
 */
function validateSlug(slug: string): Result<void> {
  if (!slug || slug.trim().length === 0) {
    return fail(new Error('Slug is required'));
  }

  return ok(undefined);
}

export class GetPricingPlanBySlugUseCase {
  constructor(private readonly pricingPlanRepository: PricingPlanRepository) {}

  async execute(input: GetPricingPlanBySlugInput): Promise<Result<GetPricingPlanBySlugOutput>> {
    // 1. Validate slug
    const slugValidation = validateSlug(input.slug);
    if (!slugValidation.success) {
      return fail(slugValidation.error);
    }

    // 2. Find plan by slug
    const planResult = await this.pricingPlanRepository.findBySlug(input.slug);

    if (!planResult.success) {
      return fail(planResult.error);
    }

    if (planResult.data === null) {
      return fail(new Error('Plan tarifaire introuvable'));
    }

    const plan = planResult.data;

    // 3. Check if plan is active
    if (!plan.isActive) {
      return fail(new Error("Ce plan tarifaire n'est pas actif"));
    }

    return ok({
      plan: plan,
    });
  }
}
