/**
 * Subscription Repository Prisma Implementation
 * Implémentation concrète avec Prisma
 * IMPORTANT: Utilise le Result Pattern pour toutes les opérations
 */

import { PrismaClient } from '@/generated/prisma';
import { Result } from '@/lib/types/result.type';
import { SubscriptionId, UserId } from '@/lib/types/branded.type';
import { SubscriptionEntity } from '@/core/entities/subscription.entity';
import { ISubscriptionRepository } from '@/core/repositories/subscription.repository.interface';

export class SubscriptionRepositoryPrisma implements ISubscriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: SubscriptionId): Promise<SubscriptionEntity | null> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id },
      });

      if (!subscription) return null;

      return this.toDomainEntity(subscription);
    } catch (error) {
      console.error('Error finding subscription by ID:', error);
      return null;
    }
  }

  async findByUser(userId: UserId): Promise<SubscriptionEntity | null> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) return null;

      return this.toDomainEntity(subscription);
    } catch (error) {
      console.error('Error finding subscription by user:', error);
      return null;
    }
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<SubscriptionEntity | null> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { stripeCustomerId },
      });

      if (!subscription) return null;

      return this.toDomainEntity(subscription);
    } catch (error) {
      console.error('Error finding subscription by Stripe customer ID:', error);
      return null;
    }
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<SubscriptionEntity | null> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { stripeSubscriptionId },
      });

      if (!subscription) return null;

      return this.toDomainEntity(subscription);
    } catch (error) {
      console.error('Error finding subscription by Stripe subscription ID:', error);
      return null;
    }
  }

  async save(subscription: SubscriptionEntity): Promise<Result<void>> {
    try {
      const data = this.toPersistence(subscription);

      await this.prisma.subscription.upsert({
        where: { id: subscription.id },
        create: data,
        update: {
          plan: data.plan,
          status: data.status,
          storesLimit: data.storesLimit,
          campaignsLimit: data.campaignsLimit,
          stripeCustomerId: data.stripeCustomerId,
          stripeSubscriptionId: data.stripeSubscriptionId,
          currentPeriodEnd: data.currentPeriodEnd,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd,
          updatedAt: new Date(),
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new Error(
          `Failed to save subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }

  async updateStripeIds(
    id: SubscriptionId,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
  ): Promise<Result<void>> {
    try {
      await this.prisma.subscription.update({
        where: { id },
        data: {
          stripeCustomerId,
          stripeSubscriptionId,
          updatedAt: new Date(),
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new Error(
          `Failed to update Stripe IDs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }

  async updateCurrentPeriodEnd(id: SubscriptionId, currentPeriodEnd: Date): Promise<Result<void>> {
    try {
      await this.prisma.subscription.update({
        where: { id },
        data: {
          currentPeriodEnd,
          updatedAt: new Date(),
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new Error(
          `Failed to update period end: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }

  async scheduleCancellation(id: SubscriptionId): Promise<Result<void>> {
    try {
      await this.prisma.subscription.update({
        where: { id },
        data: {
          cancelAtPeriodEnd: true,
          updatedAt: new Date(),
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new Error(
          `Failed to schedule cancellation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }

  async cancelScheduledCancellation(id: SubscriptionId): Promise<Result<void>> {
    try {
      await this.prisma.subscription.update({
        where: { id },
        data: {
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new Error(
          `Failed to cancel scheduled cancellation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }

  async findExpiredToProcess(): Promise<SubscriptionEntity[]> {
    try {
      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            lt: new Date(),
          },
        },
      });

      return subscriptions.map((sub) => this.toDomainEntity(sub));
    } catch (error) {
      console.error('Error finding expired subscriptions:', error);
      return [];
    }
  }

  async findToRenew(beforeDate: Date): Promise<SubscriptionEntity[]> {
    try {
      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          cancelAtPeriodEnd: false,
          currentPeriodEnd: {
            lt: beforeDate,
          },
        },
      });

      return subscriptions.map((sub) => this.toDomainEntity(sub));
    } catch (error) {
      console.error('Error finding subscriptions to renew:', error);
      return [];
    }
  }

  async countByPlan(): Promise<{
    FREE: number;
    STARTER: number;
    PROFESSIONAL: number;
    ENTERPRISE: number;
  }> {
    try {
      const [free, starter, professional, enterprise] = await Promise.all([
        this.prisma.subscription.count({ where: { plan: 'FREE' } }),
        this.prisma.subscription.count({ where: { plan: 'STARTER' } }),
        this.prisma.subscription.count({ where: { plan: 'PROFESSIONAL' } }),
        this.prisma.subscription.count({ where: { plan: 'ENTERPRISE' } }),
      ]);

      return { FREE: free, STARTER: starter, PROFESSIONAL: professional, ENTERPRISE: enterprise };
    } catch (error) {
      console.error('Error counting subscriptions by plan:', error);
      return { FREE: 0, STARTER: 0, PROFESSIONAL: 0, ENTERPRISE: 0 };
    }
  }

  async countByStatus(): Promise<{
    ACTIVE: number;
    TRIAL: number;
    CANCELLED: number;
    EXPIRED: number;
    SUSPENDED: number;
  }> {
    try {
      const [active, trial, cancelled, expired, suspended] = await Promise.all([
        this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        this.prisma.subscription.count({ where: { status: 'TRIAL' } }),
        this.prisma.subscription.count({ where: { status: 'CANCELLED' } }),
        this.prisma.subscription.count({ where: { status: 'EXPIRED' } }),
        this.prisma.subscription.count({ where: { status: 'SUSPENDED' } }),
      ]);

      return {
        ACTIVE: active,
        TRIAL: trial,
        CANCELLED: cancelled,
        EXPIRED: expired,
        SUSPENDED: suspended,
      };
    } catch (error) {
      console.error('Error counting subscriptions by status:', error);
      return { ACTIVE: 0, TRIAL: 0, CANCELLED: 0, EXPIRED: 0, SUSPENDED: 0 };
    }
  }

  async getSubscriptionStats(): Promise<{
    totalActive: number;
    totalRevenue: number;
    averageRevenue: number;
    churnRate: number;
    growthRate: number;
  }> {
    // TODO: Implémenter le calcul des statistiques
    return {
      totalActive: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      churnRate: 0,
      growthRate: 0,
    };
  }

  async checkUserLimits(userId: UserId): Promise<{
    storesUsed: number;
    storesLimit: number;
    campaignsUsed: number;
    campaignsLimit: number;
    canCreateStore: boolean;
    canCreateCampaign: boolean;
  }> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        return {
          storesUsed: 0,
          storesLimit: 0,
          campaignsUsed: 0,
          campaignsLimit: 0,
          canCreateStore: false,
          canCreateCampaign: false,
        };
      }

      const storesUsed = await this.prisma.store.count({
        where: { ownerId: userId },
      });

      const campaignsUsed = await this.prisma.campaign.count({
        where: {
          store: {
            ownerId: userId,
          },
        },
      });

      return {
        storesUsed,
        storesLimit: subscription.storesLimit,
        campaignsUsed,
        campaignsLimit: subscription.campaignsLimit,
        canCreateStore: storesUsed < subscription.storesLimit,
        canCreateCampaign: campaignsUsed < subscription.campaignsLimit,
      };
    } catch (error) {
      console.error('Error checking user limits:', error);
      return {
        storesUsed: 0,
        storesLimit: 0,
        campaignsUsed: 0,
        campaignsLimit: 0,
        canCreateStore: false,
        canCreateCampaign: false,
      };
    }
  }

  async migratePlan(
    id: SubscriptionId,
    newPlan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
  ): Promise<Result<void>> {
    try {
      const limits = this.getPlanLimits(newPlan);

      await this.prisma.subscription.update({
        where: { id },
        data: {
          plan: newPlan,
          storesLimit: limits.storesLimit,
          campaignsLimit: limits.campaignsLimit,
          updatedAt: new Date(),
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new Error(
          `Failed to migrate plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }

  // Private helpers
  private toDomainEntity(data: any): SubscriptionEntity {
    return SubscriptionEntity.fromPersistence({
      id: data.id as SubscriptionId,
      userId: data.userId as UserId,
      plan: data.plan as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
      status: data.status as 'ACTIVE' | 'TRIAL' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED',
      storesLimit: data.storesLimit,
      campaignsLimit: data.campaignsLimit,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  private toPersistence(entity: SubscriptionEntity) {
    return entity.toPersistence();
  }

  private getPlanLimits(plan: string) {
    switch (plan) {
      case 'FREE':
        return { storesLimit: 1, campaignsLimit: 1 };
      case 'STARTER':
        return { storesLimit: 3, campaignsLimit: 10 };
      case 'PROFESSIONAL':
        return { storesLimit: 10, campaignsLimit: -1 }; // -1 = unlimited
      case 'ENTERPRISE':
        return { storesLimit: -1, campaignsLimit: -1 };
      default:
        return { storesLimit: 1, campaignsLimit: 1 };
    }
  }
}
