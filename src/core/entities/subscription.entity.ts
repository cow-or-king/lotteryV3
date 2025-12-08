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
  readonly storesLimit: number;
  readonly campaignsLimit: number;
  readonly stripeCustomerId: string | null;
  readonly stripeSubscriptionId: string | null;
  readonly currentPeriodEnd: Date | null;
  readonly cancelAtPeriodEnd: boolean;
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
      storesLimit: 1,
      campaignsLimit: 1,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
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
      storesLimit: 3,
      campaignsLimit: 10,
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
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
      storesLimit: 10,
      campaignsLimit: -1, // Unlimited
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
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
      storesLimit: -1, // Unlimited
      campaignsLimit: -1, // Unlimited
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok(subscription);
  }

  /**
   * Reconstructs entity from database
   * Used by subscription.repository.prisma.ts
   */
  static fromPersistence(props: SubscriptionProps): SubscriptionEntity {
    return new SubscriptionEntity(props);
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
    return this.props.storesLimit;
  }

  get campaignsLimit(): number {
    return this.props.campaignsLimit;
  }

  get stripeCustomerId(): string | null {
    return this.props.stripeCustomerId;
  }

  get stripeSubscriptionId(): string | null {
    return this.props.stripeSubscriptionId;
  }

  get currentPeriodEnd(): Date | null {
    return this.props.currentPeriodEnd;
  }

  get cancelAtPeriodEnd(): boolean {
    return this.props.cancelAtPeriodEnd;
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
    return this.props.storesLimit === -1 || currentStoresCount < this.props.storesLimit;
  }

  /**
   * Checks if user can create a new campaign based on current count
   */
  canCreateCampaign(currentCampaignsCount: number): boolean {
    return (
      this.props.status === 'ACTIVE' &&
      (this.props.campaignsLimit === -1 || currentCampaignsCount < this.props.campaignsLimit)
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
    return this.props.currentPeriodEnd !== null && this.props.currentPeriodEnd < new Date();
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

    const limits = this.getPlanLimits(newPlan);

    const upgraded = new SubscriptionEntity({
      ...this.props,
      plan: newPlan,
      storesLimit: limits.storesLimit,
      campaignsLimit: limits.campaignsLimit,
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

    const limits = this.getPlanLimits(newPlan);

    const downgraded = new SubscriptionEntity({
      ...this.props,
      plan: newPlan,
      storesLimit: limits.storesLimit,
      campaignsLimit: limits.campaignsLimit,
      updatedAt: new Date(),
    });

    return Result.ok(downgraded);
  }

  /**
   * Cancels subscription at the end of current period
   * Status remains ACTIVE until period end
   */
  cancel(): Result<SubscriptionEntity> {
    if (this.props.cancelAtPeriodEnd) {
      return Result.fail(new InvalidSubscriptionError('Subscription is already set to cancel'));
    }

    if (this.props.status === 'CANCELLED' || this.props.status === 'EXPIRED') {
      return Result.fail(new InvalidSubscriptionError('Cannot cancel an inactive subscription'));
    }

    const cancelled = new SubscriptionEntity({
      ...this.props,
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    });

    return Result.ok(cancelled);
  }

  /**
   * Reactivates a cancelled subscription before period end
   */
  reactivate(): Result<SubscriptionEntity> {
    if (!this.props.cancelAtPeriodEnd) {
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
      cancelAtPeriodEnd: false,
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

  private getPlanLimits(plan: SubscriptionPlan): {
    storesLimit: number;
    campaignsLimit: number;
  } {
    const limits: Record<SubscriptionPlan, { storesLimit: number; campaignsLimit: number }> = {
      FREE: { storesLimit: 1, campaignsLimit: 1 },
      STARTER: { storesLimit: 3, campaignsLimit: 10 },
      PROFESSIONAL: { storesLimit: 10, campaignsLimit: -1 },
      ENTERPRISE: { storesLimit: -1, campaignsLimit: -1 },
    };

    return limits[plan];
  }

  // Serialization

  /**
   * Converts entity to persistence format
   * Used by subscription.repository.prisma.ts
   */
  toPersistence(): SubscriptionPersistence {
    return {
      id: this.props.id as string,
      userId: this.props.userId as string,
      plan: this.props.plan,
      status: this.props.status,
      storesLimit: this.props.storesLimit,
      campaignsLimit: this.props.campaignsLimit,
      stripeCustomerId: this.props.stripeCustomerId,
      stripeSubscriptionId: this.props.stripeSubscriptionId,
      currentPeriodEnd: this.props.currentPeriodEnd,
      cancelAtPeriodEnd: this.props.cancelAtPeriodEnd,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
