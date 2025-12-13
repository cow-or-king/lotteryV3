/**
 * Subscription Entity - Core Domain Logic
 * RÈGLES STRICTES:
 * - ✅ AUCUN type 'any'
 * - ✅ AUCUNE dépendance externe
 * - ✅ Result Pattern pour toutes les erreurs
 * - ✅ Branded Types pour tous les IDs
 * - ✅ Types explicites partout
 */

import { Result } from '@/lib/types/result.type';
import { SubscriptionId, UserId } from '@/lib/types/branded.type';
import { SubscriptionLimits } from '../value-objects/subscription-limits.value-object';
import { SubscriptionBilling } from '../value-objects/subscription-billing.value-object';

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

// Type Definitions
export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';

export interface SubscriptionProps {
  readonly id: SubscriptionId;
  readonly userId: UserId;
  readonly plan: SubscriptionPlan;
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
  readonly plan: SubscriptionPlan;
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

/**
 * Subscription Entity
 * Encapsule toute la logique métier liée aux abonnements
 */
export class SubscriptionEntity {
  private constructor(private readonly props: SubscriptionProps) {}

  // Factory Methods

  /**
   * Creates a new FREE subscription for a user
   * Used by register-user.use-case.ts
   */
  static createFree(userId: UserId): Result<SubscriptionEntity> {
    const now = new Date();
    const subscriptionId = this.generateSubscriptionId();

    const subscription = new SubscriptionEntity({
      id: subscriptionId,
      userId,
      plan: 'FREE',
      status: 'ACTIVE',
      limits: SubscriptionLimits.forPlan('FREE'),
      billing: SubscriptionBilling.createFree(),
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok(subscription);
  }

  /**
   * Creates a new STARTER subscription (paid)
   */
  static createStarter(
    userId: UserId,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    currentPeriodEnd: Date,
  ): Result<SubscriptionEntity> {
    const now = new Date();
    const subscriptionId = this.generateSubscriptionId();

    const subscription = new SubscriptionEntity({
      id: subscriptionId,
      userId,
      plan: 'STARTER',
      status: 'ACTIVE',
      limits: SubscriptionLimits.forPlan('STARTER'),
      billing: SubscriptionBilling.createPaid(
        stripeCustomerId,
        stripeSubscriptionId,
        currentPeriodEnd,
      ),
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok(subscription);
  }

  /**
   * Creates a new PROFESSIONAL subscription
   */
  static createProfessional(
    userId: UserId,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    currentPeriodEnd: Date,
  ): Result<SubscriptionEntity> {
    const now = new Date();
    const subscriptionId = this.generateSubscriptionId();

    const subscription = new SubscriptionEntity({
      id: subscriptionId,
      userId,
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      limits: SubscriptionLimits.forPlan('PROFESSIONAL'),
      billing: SubscriptionBilling.createPaid(
        stripeCustomerId,
        stripeSubscriptionId,
        currentPeriodEnd,
      ),
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok(subscription);
  }

  /**
   * Creates a new ENTERPRISE subscription
   */
  static createEnterprise(
    userId: UserId,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    currentPeriodEnd: Date,
  ): Result<SubscriptionEntity> {
    const now = new Date();
    const subscriptionId = this.generateSubscriptionId();

    const subscription = new SubscriptionEntity({
      id: subscriptionId,
      userId,
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      limits: SubscriptionLimits.forPlan('ENTERPRISE'),
      billing: SubscriptionBilling.createPaid(
        stripeCustomerId,
        stripeSubscriptionId,
        currentPeriodEnd,
      ),
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok(subscription);
  }

  /**
   * Reconstructs entity from database
   * Used by subscription.repository.prisma.ts
   */
  static fromPersistence(props: SubscriptionPropsFromPersistence): SubscriptionEntity {
    return new SubscriptionEntity({
      id: props.id,
      userId: props.userId,
      plan: props.plan,
      status: props.status,
      limits: SubscriptionLimits.create(props.storesLimit, props.campaignsLimit),
      billing: SubscriptionBilling.create({
        stripeCustomerId: props.stripeCustomerId,
        stripeSubscriptionId: props.stripeSubscriptionId,
        currentPeriodEnd: props.currentPeriodEnd,
        cancelAtPeriodEnd: props.cancelAtPeriodEnd,
      }),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  // Getters

  get id(): SubscriptionId {
    return this.props.id;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get plan(): SubscriptionPlan {
    return this.props.plan;
  }

  get status(): SubscriptionStatus {
    return this.props.status;
  }

  get storesLimit(): number {
    return this.props.limits.storesLimit;
  }

  get campaignsLimit(): number {
    return this.props.limits.campaignsLimit;
  }

  get limits(): SubscriptionLimits {
    return this.props.limits;
  }

  get billing(): SubscriptionBilling {
    return this.props.billing;
  }

  get stripeCustomerId(): string | null {
    return this.props.billing.stripeCustomerId;
  }

  get stripeSubscriptionId(): string | null {
    return this.props.billing.stripeSubscriptionId;
  }

  get currentPeriodEnd(): Date | null {
    return this.props.billing.currentPeriodEnd;
  }

  get cancelAtPeriodEnd(): boolean {
    return this.props.billing.cancelAtPeriodEnd;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Logic

  /**
   * Checks if user can create a new store based on current count
   */
  canCreateStore(currentStoresCount: number): boolean {
    return this.props.limits.canCreateStore(currentStoresCount);
  }

  /**
   * Checks if user can create a new campaign based on current count
   */
  canCreateCampaign(currentCampaignsCount: number): boolean {
    return (
      this.props.status === 'ACTIVE' && this.props.limits.canCreateCampaign(currentCampaignsCount)
    );
  }

  /**
   * Checks if subscription is currently active
   */
  isActive(): boolean {
    return this.props.status === 'ACTIVE' || this.props.status === 'TRIAL';
  }

  /**
   * Checks if subscription has expired
   */
  isExpired(): boolean {
    return this.props.billing.isExpired();
  }

  /**
   * Upgrades subscription to a higher plan
   * Validates upgrade path: FREE < STARTER < PROFESSIONAL < ENTERPRISE
   */
  upgrade(newPlan: SubscriptionPlan): Result<SubscriptionEntity> {
    if (!this.canUpgradeTo(this.props.plan, newPlan)) {
      return Result.fail(
        new SubscriptionUpgradeError(
          `Cannot upgrade from ${this.props.plan} to ${newPlan}. Must follow hierarchy: FREE < STARTER < PROFESSIONAL < ENTERPRISE`,
        ),
      );
    }

    const upgraded = new SubscriptionEntity({
      ...this.props,
      plan: newPlan,
      limits: SubscriptionLimits.forPlan(newPlan),
      updatedAt: new Date(),
    });

    return Result.ok(upgraded);
  }

  /**
   * Downgrades subscription to a lower plan
   */
  downgrade(newPlan: SubscriptionPlan): Result<SubscriptionEntity> {
    if (!this.canDowngradeTo(this.props.plan, newPlan)) {
      return Result.fail(
        new SubscriptionUpgradeError(`Cannot downgrade from ${this.props.plan} to ${newPlan}`),
      );
    }

    const downgraded = new SubscriptionEntity({
      ...this.props,
      plan: newPlan,
      limits: SubscriptionLimits.forPlan(newPlan),
      updatedAt: new Date(),
    });

    return Result.ok(downgraded);
  }

  /**
   * Cancels subscription at the end of current period
   * Status remains ACTIVE until period end
   */
  cancel(): Result<SubscriptionEntity> {
    if (this.props.billing.cancelAtPeriodEnd) {
      return Result.fail(new InvalidSubscriptionError('Subscription is already set to cancel'));
    }

    if (this.props.status === 'CANCELLED' || this.props.status === 'EXPIRED') {
      return Result.fail(new InvalidSubscriptionError('Cannot cancel an inactive subscription'));
    }

    const cancelled = new SubscriptionEntity({
      ...this.props,
      billing: this.props.billing.withCancelAtPeriodEnd(),
      updatedAt: new Date(),
    });

    return Result.ok(cancelled);
  }

  /**
   * Reactivates a cancelled subscription before period end
   */
  reactivate(): Result<SubscriptionEntity> {
    if (!this.props.billing.cancelAtPeriodEnd) {
      return Result.fail(new InvalidSubscriptionError('Subscription is not cancelled'));
    }

    if (this.isExpired()) {
      return Result.fail(
        new InvalidSubscriptionError(
          'Cannot reactivate expired subscription. Please subscribe again.',
        ),
      );
    }

    const reactivated = new SubscriptionEntity({
      ...this.props,
      billing: this.props.billing.withoutCancelAtPeriodEnd(),
      updatedAt: new Date(),
    });

    return Result.ok(reactivated);
  }

  /**
   * Expires the subscription
   * Typically called by background job when period ends
   */
  expire(): Result<SubscriptionEntity> {
    if (this.props.status === 'EXPIRED') {
      return Result.fail(new InvalidSubscriptionError('Subscription is already expired'));
    }

    const expired = new SubscriptionEntity({
      ...this.props,
      status: 'EXPIRED',
      updatedAt: new Date(),
    });

    return Result.ok(expired);
  }

  // Private Helpers

  private static generateSubscriptionId(): SubscriptionId {
    return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as SubscriptionId;
  }

  private canUpgradeTo(from: SubscriptionPlan, to: SubscriptionPlan): boolean {
    const planHierarchy: Record<SubscriptionPlan, number> = {
      FREE: 0,
      STARTER: 1,
      PROFESSIONAL: 2,
      ENTERPRISE: 3,
    };

    return planHierarchy[to] > planHierarchy[from];
  }

  private canDowngradeTo(from: SubscriptionPlan, to: SubscriptionPlan): boolean {
    const planHierarchy: Record<SubscriptionPlan, number> = {
      FREE: 0,
      STARTER: 1,
      PROFESSIONAL: 2,
      ENTERPRISE: 3,
    };

    return planHierarchy[to] < planHierarchy[from];
  }

  // Serialization

  /**
   * Converts entity to persistence format
   * Used by subscription.repository.prisma.ts
   */
  toPersistence(): SubscriptionPersistence {
    const billingProps = this.props.billing.toPersistence();
    return {
      id: this.props.id as string,
      userId: this.props.userId as string,
      plan: this.props.plan,
      status: this.props.status,
      storesLimit: this.props.limits.storesLimit,
      campaignsLimit: this.props.limits.campaignsLimit,
      stripeCustomerId: billingProps.stripeCustomerId,
      stripeSubscriptionId: billingProps.stripeSubscriptionId,
      currentPeriodEnd: billingProps.currentPeriodEnd,
      cancelAtPeriodEnd: billingProps.cancelAtPeriodEnd,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
