/**
 * ListPricingPlans Use Case
 * Lists all active pricing plans ordered by displayOrder
 * IMPORTANT: ZERO any types, Result Pattern
 * Architecture Hexagonale: Use Case ne dépend PAS de l'infrastructure
 */

import type { Result } from '@/lib/types/result.type';
import { ok, fail } from '@/lib/types/result.type';
import type { PricingPlanRepository } from '@/core/ports/pricing-plan.repository';
import type { PricingPlanEntity } from '@/core/entities/pricing-plan.entity';

export interface ListPricingPlansInput {
  // No input needed for listing active plans
}

export interface ListPricingPlansOutput {
  plans: PricingPlanEntity[];
  total: number;
}

export class ListPricingPlansUseCase {
  constructor(private readonly pricingPlanRepository: PricingPlanRepository) {}

  async execute(_input: ListPricingPlansInput): Promise<Result<ListPricingPlansOutput>> {
    // List all active plans ordered by displayOrder
    const plansResult = await this.pricingPlanRepository.findAllActive();

    if (!plansResult.success) {
      return fail(plansResult.error);
    }

    return ok({
      plans: plansResult.data,
      total: plansResult.data.length,
    });
  }
}
