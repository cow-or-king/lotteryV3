/**
 * Subscription Plan Value Object
 * Encapsulates plan hierarchy and validation logic
 * IMPORTANT: ZERO any types
 */

export type SubscriptionPlanType = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

const PLAN_HIERARCHY: Record<SubscriptionPlanType, number> = {
  FREE: 0,
  STARTER: 1,
  PROFESSIONAL: 2,
  ENTERPRISE: 3,
};

export class SubscriptionPlan {
  private constructor(private readonly value: SubscriptionPlanType) {}

  static from(plan: SubscriptionPlanType): SubscriptionPlan {
    return new SubscriptionPlan(plan);
  }

  getValue(): SubscriptionPlanType {
    return this.value;
  }

  /**
   * Can this plan be upgraded to target plan?
   */
  canUpgradeTo(target: SubscriptionPlanType): boolean {
    return PLAN_HIERARCHY[target] > PLAN_HIERARCHY[this.value];
  }

  /**
   * Can this plan be downgraded to target plan?
   */
  canDowngradeTo(target: SubscriptionPlanType): boolean {
    return PLAN_HIERARCHY[target] < PLAN_HIERARCHY[this.value];
  }

  /**
   * Get hierarchy level (0-3)
   */
  getHierarchyLevel(): number {
    return PLAN_HIERARCHY[this.value];
  }

  equals(other: SubscriptionPlan): boolean {
    return this.value === other.value;
  }
}
