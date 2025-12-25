/**
 * Subscription Entity - Core Domain Logic
 * IMPORTANT: ZERO any types, Result Pattern, Branded Types
 */

import { Result } from '@/lib/types/result.type';
import { UserId } from '@/lib/types/branded.type';
import { SubscriptionLimits } from '../value-objects/subscription-limits.value-object';
import { SubscriptionBilling } from '../value-objects/subscription-billing.value-object';
import { SubscriptionPlan } from '../value-objects/subscription-plan.value-object';
import { SubscriptionFactory } from '../factories/subscription.factory';
import type { SubscriptionPlanType } from '../value-objects/subscription-plan.value-object';
import type {
  SubscriptionProps,
  SubscriptionPersistence,
  SubscriptionPropsFromPersistence,
} from './subscription.types';
import { InvalidSubscriptionError, SubscriptionUpgradeError } from './subscription.types';

// Re-export types and errors
export type { SubscriptionPlan } from './subscription.types';
export type { SubscriptionStatus } from './subscription.types';
export {
  InvalidSubscriptionError,
  SubscriptionUpgradeError,
  SubscriptionLimitError,
} from './subscription.types';
export type {
  SubscriptionProps,
  SubscriptionPersistence,
  SubscriptionPropsFromPersistence,
} from './subscription.types';

/**
 * Subscription Entity
 * Encapsule toute la logique métier liée aux abonnements
 */
export class SubscriptionEntity {
  private constructor(private readonly props: SubscriptionProps) {}

  // Factory Methods (delegated to SubscriptionFactory)

  static createFree(userId: UserId): Result<SubscriptionEntity> {
    return Result.ok(new SubscriptionEntity(SubscriptionFactory.createFreeProps(userId)));
  }

  static createStarter(
    userId: UserId,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    currentPeriodEnd: Date,
  ): Result<SubscriptionEntity> {
    return Result.ok(
      new SubscriptionEntity(
        SubscriptionFactory.createStarterProps(
          userId,
          stripeCustomerId,
          stripeSubscriptionId,
          currentPeriodEnd,
        ),
      ),
    );
  }

  static createProfessional(
    userId: UserId,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    currentPeriodEnd: Date,
  ): Result<SubscriptionEntity> {
    return Result.ok(
      new SubscriptionEntity(
        SubscriptionFactory.createProfessionalProps(
          userId,
          stripeCustomerId,
          stripeSubscriptionId,
          currentPeriodEnd,
        ),
      ),
    );
  }

  static createEnterprise(
    userId: UserId,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    currentPeriodEnd: Date,
  ): Result<SubscriptionEntity> {
    return Result.ok(
      new SubscriptionEntity(
        SubscriptionFactory.createEnterpriseProps(
          userId,
          stripeCustomerId,
          stripeSubscriptionId,
          currentPeriodEnd,
        ),
      ),
    );
  }

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

  // Core getters
  get id() {
    return this.props.id;
  }
  get userId() {
    return this.props.userId;
  }
  get plan() {
    return this.props.plan;
  }
  get status() {
    return this.props.status;
  }
  get limits() {
    return this.props.limits;
  }
  get billing() {
    return this.props.billing;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  // Convenience getters
  get storesLimit() {
    return this.props.limits.storesLimit;
  }
  get campaignsLimit() {
    return this.props.limits.campaignsLimit;
  }
  get stripeCustomerId() {
    return this.props.billing.stripeCustomerId;
  }
  get stripeSubscriptionId() {
    return this.props.billing.stripeSubscriptionId;
  }
  get currentPeriodEnd() {
    return this.props.billing.currentPeriodEnd;
  }
  get cancelAtPeriodEnd() {
    return this.props.billing.cancelAtPeriodEnd;
  }

  // Business logic
  canCreateStore(currentStoresCount: number): boolean {
    return this.props.limits.canCreateStore(currentStoresCount);
  }

  canCreateCampaign(currentCampaignsCount: number): boolean {
    return (
      this.props.status === 'ACTIVE' && this.props.limits.canCreateCampaign(currentCampaignsCount)
    );
  }

  isActive(): boolean {
    return this.props.status === 'ACTIVE' || this.props.status === 'TRIAL';
  }

  isExpired(): boolean {
    return this.props.billing.isExpired();
  }

  upgrade(newPlan: SubscriptionPlanType): Result<SubscriptionEntity> {
    const currentPlan = SubscriptionPlan.from(this.props.plan);

    if (!currentPlan.canUpgradeTo(newPlan)) {
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

  downgrade(newPlan: SubscriptionPlanType): Result<SubscriptionEntity> {
    const currentPlan = SubscriptionPlan.from(this.props.plan);

    if (!currentPlan.canDowngradeTo(newPlan)) {
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
