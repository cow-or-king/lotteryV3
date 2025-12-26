/**
 * UpdatePricingPlan Use Case
 * Updates an existing pricing plan
 * IMPORTANT: ZERO any types, Result Pattern
 * Architecture Hexagonale: Use Case ne dépend PAS de l'infrastructure
 */

import type { Result } from '@/lib/types/result.type';
import { ok, fail } from '@/lib/types/result.type';
import type { PricingPlanRepository } from '@/core/ports/pricing-plan.repository';
import type { PricingPlanEntity } from '@/core/entities/pricing-plan.entity';
import type { PricingPlanId } from '@/lib/types/branded.type';
import type { PricingFeatureInput } from './types';

export type { PricingFeatureInput };

export interface UpdatePricingPlanInput {
  id: PricingPlanId;
  name?: string;
  slug?: string;
  description?: string;
  monthlyPrice?: number | null;
  annualPrice?: number | null;
  currency?: string;
  isActive?: boolean;
  isPopular?: boolean;
  displayOrder?: number;
  ctaText?: string;
  ctaHref?: string;
  badgeText?: string | null;
  features?: PricingFeatureInput[];
}

export interface UpdatePricingPlanOutput {
  plan: PricingPlanEntity;
}

/**
 * Validates that the plan exists
 */
async function checkPlanExists(
  repository: PricingPlanRepository,
  id: PricingPlanId,
): Promise<Result<PricingPlanEntity>> {
  const planResult = await repository.findById(id);

  if (!planResult.success) {
    return fail(planResult.error);
  }

  if (planResult.data === null) {
    return fail(new Error('Plan tarifaire introuvable'));
  }

  return ok(planResult.data);
}

/**
 * Validates that the slug is unique (if changed)
 */
async function checkSlugUniqueness(
  repository: PricingPlanRepository,
  slug: string,
  currentSlug: string,
): Promise<Result<void>> {
  // Only check if slug is being changed
  if (slug === currentSlug) {
    return ok(undefined);
  }

  const existingPlanResult = await repository.findBySlug(slug);

  if (!existingPlanResult.success) {
    return fail(existingPlanResult.error);
  }

  if (existingPlanResult.data !== null) {
    return fail(new Error('Un plan tarifaire avec ce slug existe déjà'));
  }

  return ok(undefined);
}

export class UpdatePricingPlanUseCase {
  constructor(private readonly pricingPlanRepository: PricingPlanRepository) {}

  async execute(input: UpdatePricingPlanInput): Promise<Result<UpdatePricingPlanOutput>> {
    // 1. Check plan exists
    const planResult = await checkPlanExists(this.pricingPlanRepository, input.id);
    if (!planResult.success) {
      return fail(planResult.error);
    }

    const existingPlan = planResult.data;

    // 2. Check slug uniqueness if changed
    if (input.slug) {
      const slugCheckResult = await checkSlugUniqueness(
        this.pricingPlanRepository,
        input.slug,
        existingPlan.slug,
      );
      if (!slugCheckResult.success) {
        return fail(slugCheckResult.error);
      }
    }

    // 3. Update plan via repository (entity validation happens in repository)
    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.monthlyPrice !== undefined) updateData.monthlyPrice = input.monthlyPrice;
    if (input.annualPrice !== undefined) updateData.annualPrice = input.annualPrice;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.isPopular !== undefined) updateData.isPopular = input.isPopular;
    if (input.displayOrder !== undefined) updateData.displayOrder = input.displayOrder;
    if (input.ctaText !== undefined) updateData.ctaText = input.ctaText;
    if (input.ctaHref !== undefined) updateData.ctaHref = input.ctaHref;
    if (input.badgeText !== undefined) updateData.badgeText = input.badgeText;

    const updateResult = await this.pricingPlanRepository.update(input.id, updateData);

    if (!updateResult.success) {
      return fail(updateResult.error);
    }

    return ok({
      plan: updateResult.data,
    });
  }
}
