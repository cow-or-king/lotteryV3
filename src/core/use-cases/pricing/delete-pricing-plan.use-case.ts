/**
 * DeletePricingPlan Use Case
 * Deletes a pricing plan
 * IMPORTANT: ZERO any types, Result Pattern
 * Architecture Hexagonale: Use Case ne dépend PAS de l'infrastructure
 */

import type { Result } from '@/lib/types/result.type';
import { ok, fail } from '@/lib/types/result.type';
import type { PricingPlanRepository } from '@/core/ports/pricing-plan.repository';
import type { PricingPlanId } from '@/lib/types/branded.type';

export interface DeletePricingPlanInput {
  id: PricingPlanId;
}

export interface DeletePricingPlanOutput {
  success: true;
}

/**
 * Validates that the plan exists
 */
async function checkPlanExists(
  repository: PricingPlanRepository,
  id: PricingPlanId,
): Promise<Result<void>> {
  const planResult = await repository.findById(id);

  if (!planResult.success) {
    return fail(planResult.error);
  }

  if (planResult.data === null) {
    return fail(new Error('Plan tarifaire introuvable'));
  }

  return ok(undefined);
}

export class DeletePricingPlanUseCase {
  constructor(private readonly pricingPlanRepository: PricingPlanRepository) {}

  async execute(input: DeletePricingPlanInput): Promise<Result<DeletePricingPlanOutput>> {
    // 1. Check plan exists
    const planCheckResult = await checkPlanExists(this.pricingPlanRepository, input.id);
    if (!planCheckResult.success) {
      return fail(planCheckResult.error);
    }

    // 2. Delete plan (cascade delete features)
    const deleteResult = await this.pricingPlanRepository.delete(input.id);

    if (!deleteResult.success) {
      return fail(deleteResult.error);
    }

    return ok({
      success: true,
    });
  }
}
