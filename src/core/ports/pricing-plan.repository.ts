/**
 * PricingPlan Repository Port
 * Interface pour abstraire l'accès aux pricing plans
 * Architecture hexagonale: Port dans le core, Adapter dans l'infrastructure
 */

import type { Result } from '@/lib/types/result.type';
import type {
  PricingPlanEntity,
  CreatePricingPlanProps,
  UpdatePricingPlanProps,
} from '@/core/entities/pricing-plan.entity';
import type { PricingPlanId } from '@/lib/types/branded.type';

export type { PricingPlanEntity, CreatePricingPlanProps, UpdatePricingPlanProps };

export interface PricingPlanRepository {
  findAll(): Promise<Result<PricingPlanEntity[]>>;
  findById(id: PricingPlanId): Promise<Result<PricingPlanEntity | null>>;
  findBySlug(slug: string): Promise<Result<PricingPlanEntity | null>>;
  findAllActive(): Promise<Result<PricingPlanEntity[]>>;
  create(props: CreatePricingPlanProps): Promise<Result<PricingPlanEntity>>;
  update(id: PricingPlanId, props: UpdatePricingPlanProps): Promise<Result<PricingPlanEntity>>;
  delete(id: PricingPlanId): Promise<Result<void>>;
  updateDisplayOrder(id: PricingPlanId, order: number): Promise<Result<void>>;
}
