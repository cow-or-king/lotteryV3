/**
 * Subscription Limits Value Object
 * Encapsulates all logic related to subscription limits (stores/campaigns)
 * RÈGLES STRICTES:
 * - ✅ AUCUN type 'any'
 * - ✅ AUCUNE dépendance externe
 * - ✅ Immutable value object
 */

import { SubscriptionPlan } from '../entities/subscription.entity';

export interface SubscriptionLimitsProps {
  readonly storesLimit: number;
  readonly campaignsLimit: number;
}

/**
 * SubscriptionLimits Value Object
 * Gère les limites de stores et campagnes par plan
 */
export class SubscriptionLimits {
  private constructor(private readonly props: SubscriptionLimitsProps) {}

  static forPlan(plan: SubscriptionPlan): SubscriptionLimits {
    const limits = this.getPlanLimits(plan);
    return new SubscriptionLimits(limits);
  }

  static create(storesLimit: number, campaignsLimit: number): SubscriptionLimits {
    return new SubscriptionLimits({ storesLimit, campaignsLimit });
  }

  get storesLimit(): number {
    return this.props.storesLimit;
  }

  get campaignsLimit(): number {
    return this.props.campaignsLimit;
  }

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
    return this.props.campaignsLimit === -1 || currentCampaignsCount < this.props.campaignsLimit;
  }

  /**
   * Returns true if stores are unlimited
   */
  hasUnlimitedStores(): boolean {
    return this.props.storesLimit === -1;
  }

  /**
   * Returns true if campaigns are unlimited
   */
  hasUnlimitedCampaigns(): boolean {
    return this.props.campaignsLimit === -1;
  }

  private static getPlanLimits(plan: SubscriptionPlan): SubscriptionLimitsProps {
    const limits: Record<SubscriptionPlan, SubscriptionLimitsProps> = {
      FREE: { storesLimit: 1, campaignsLimit: 1 },
      STARTER: { storesLimit: 3, campaignsLimit: 10 },
      PROFESSIONAL: { storesLimit: 10, campaignsLimit: -1 },
      ENTERPRISE: { storesLimit: -1, campaignsLimit: -1 },
    };

    return limits[plan];
  }
}
