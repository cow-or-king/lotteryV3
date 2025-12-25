/**
 * Subscription Types
 * Type definitions for subscription entity
 * IMPORTANT: ZERO any types
 */

import type { SubscriptionId, UserId } from '@/lib/types/branded.type';
import type { SubscriptionLimits } from '../value-objects/subscription-limits.value-object';
import type { SubscriptionBilling } from '../value-objects/subscription-billing.value-object';
import type { SubscriptionPlanType } from '../value-objects/subscription-plan.value-object';

export type { SubscriptionPlanType as SubscriptionPlan } from '../value-objects/subscription-plan.value-object';
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';

export interface SubscriptionProps {
  readonly id: SubscriptionId;
  readonly userId: UserId;
  readonly plan: SubscriptionPlanType;
  readonly status: SubscriptionStatus;
  readonly limits: SubscriptionLimits;
  readonly billing: SubscriptionBilling;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SubscriptionPersistence {
  readonly id: string;
  readonly userId: string;
  readonly plan: string;
  readonly status: string;
  readonly storesLimit: number;
  readonly campaignsLimit: number;
  readonly stripeCustomerId: string | null;
  readonly stripeSubscriptionId: string | null;
  readonly currentPeriodEnd: Date | null;
  readonly cancelAtPeriodEnd: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SubscriptionPropsFromPersistence {
  readonly id: SubscriptionId;
  readonly userId: UserId;
  readonly plan: SubscriptionPlanType;
  readonly status: SubscriptionStatus;
  readonly storesLimit: number;
  readonly campaignsLimit: number;
  readonly stripeCustomerId: string | null;
  readonly stripeSubscriptionId: string | null;
  readonly currentPeriodEnd: Date | null;
  readonly cancelAtPeriodEnd: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Domain Errors
export class InvalidSubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSubscriptionError';
  }
}

export class SubscriptionUpgradeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionUpgradeError';
  }
}

export class SubscriptionLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionLimitError';
  }
}
