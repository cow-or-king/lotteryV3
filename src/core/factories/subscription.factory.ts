/**
 * Subscription Factory
 * Centralizes subscription creation logic
 * IMPORTANT: ZERO any types
 */

import { SubscriptionId, UserId } from '@/lib/types/branded.type';
import { SubscriptionLimits } from '../value-objects/subscription-limits.value-object';
import { SubscriptionBilling } from '../value-objects/subscription-billing.value-object';
import type { SubscriptionProps } from '../entities/subscription.types';
import type { SubscriptionPlanType } from '../value-objects/subscription-plan.value-object';

export class SubscriptionFactory {
  /**
   * Generate unique subscription ID
   */
  static generateSubscriptionId(): SubscriptionId {
    return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as SubscriptionId;
  }

  /**
   * Create subscription properties for a given plan
   */
  private static createPropsForPlan(
    userId: UserId,
    plan: SubscriptionPlanType,
    billing: SubscriptionBilling,
  ): SubscriptionProps {
    const now = new Date();
    return {
      id: this.generateSubscriptionId(),
      userId,
      plan,
      status: 'ACTIVE',
      limits: SubscriptionLimits.forPlan(plan),
      billing,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates props for FREE subscription
   */
  static createFreeProps(userId: UserId): SubscriptionProps {
    return this.createPropsForPlan(userId, 'FREE', SubscriptionBilling.createFree());
  }

  /**
   * Creates props for STARTER subscription
   */
  static createStarterProps(
    userId: UserId,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    currentPeriodEnd: Date,
  ): SubscriptionProps {
    return this.createPropsForPlan(
      userId,
      'STARTER',
      SubscriptionBilling.createPaid(stripeCustomerId, stripeSubscriptionId, currentPeriodEnd),
    );
  }

  /**
   * Creates props for PROFESSIONAL subscription
   */
  static createProfessionalProps(
    userId: UserId,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    currentPeriodEnd: Date,
  ): SubscriptionProps {
    return this.createPropsForPlan(
      userId,
      'PROFESSIONAL',
      SubscriptionBilling.createPaid(stripeCustomerId, stripeSubscriptionId, currentPeriodEnd),
    );
  }

  /**
   * Creates props for ENTERPRISE subscription
   */
  static createEnterpriseProps(
    userId: UserId,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    currentPeriodEnd: Date,
  ): SubscriptionProps {
    return this.createPropsForPlan(
      userId,
      'ENTERPRISE',
      SubscriptionBilling.createPaid(stripeCustomerId, stripeSubscriptionId, currentPeriodEnd),
    );
  }
}
