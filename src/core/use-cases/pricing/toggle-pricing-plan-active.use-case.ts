/**
 * TogglePricingPlanActive Use Case
 * Activates or deactivates a pricing plan
 * IMPORTANT: ZERO any types, Result Pattern
 * Architecture Hexagonale: Use Case ne dépend PAS de l'infrastructure
 */

import type { Result } from '@/lib/types/result.type';
import { ok, fail } from '@/lib/types/result.type';
import type { PricingPlanRepository } from '@/core/ports/pricing-plan.repository';
import type { PricingPlanEntity } from '@/core/entities/pricing-plan.entity';
import type { PricingPlanId } from '@/lib/types/branded.type';

export interface TogglePricingPlanActiveInput {
  id: PricingPlanId;
  isActive: boolean;
}

export interface TogglePricingPlanActiveOutput {
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

export class TogglePricingPlanActiveUseCase {
  constructor(private readonly pricingPlanRepository: PricingPlanRepository) {}

  async execute(
    input: TogglePricingPlanActiveInput,
  ): Promise<Result<TogglePricingPlanActiveOutput>> {
    // 1. Check plan exists
    const planResult = await checkPlanExists(this.pricingPlanRepository, input.id);
    if (!planResult.success) {
      return fail(planResult.error);
    }

    // 2. Toggle isActive status
    const updateResult = await this.pricingPlanRepository.update(input.id, {
      isActive: input.isActive,
    });

    if (!updateResult.success) {
      return fail(updateResult.error);
    }

    return ok({
      plan: updateResult.data,
    });
  }
}
