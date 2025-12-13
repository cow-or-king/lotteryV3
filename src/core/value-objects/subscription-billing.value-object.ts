/**
 * Subscription Billing Value Object
 * Encapsulates all Stripe-related billing logic
 * RÈGLES STRICTES:
 * - ✅ AUCUN type 'any'
 * - ✅ AUCUNE dépendance externe
 * - ✅ Immutable value object
 */

export interface SubscriptionBillingProps {
  readonly stripeCustomerId: string | null;
  readonly stripeSubscriptionId: string | null;
  readonly currentPeriodEnd: Date | null;
  readonly cancelAtPeriodEnd: boolean;
}

/**
 * SubscriptionBilling Value Object
 * Gère les informations de facturation Stripe
 */
export class SubscriptionBilling {
  private constructor(private readonly props: SubscriptionBillingProps) {}

  static create(props: SubscriptionBillingProps): SubscriptionBilling {
    return new SubscriptionBilling(props);
  }

  static createFree(): SubscriptionBilling {
    return new SubscriptionBilling({
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });
  }

  static createPaid(
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    currentPeriodEnd: Date,
  ): SubscriptionBilling {
    return new SubscriptionBilling({
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    });
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

  /**
   * Checks if billing information is set (paid subscription)
   */
  isPaid(): boolean {
    return this.props.stripeCustomerId !== null && this.props.stripeSubscriptionId !== null;
  }

  /**
   * Checks if subscription has expired
   */
  isExpired(): boolean {
    return this.props.currentPeriodEnd !== null && this.props.currentPeriodEnd < new Date();
  }

  /**
   * Checks if subscription is set to cancel at period end
   */
  isCancelling(): boolean {
    return this.props.cancelAtPeriodEnd;
  }

  /**
   * Returns billing with cancel flag set
   */
  withCancelAtPeriodEnd(): SubscriptionBilling {
    return new SubscriptionBilling({
      ...this.props,
      cancelAtPeriodEnd: true,
    });
  }

  /**
   * Returns billing with cancel flag removed (reactivation)
   */
  withoutCancelAtPeriodEnd(): SubscriptionBilling {
    return new SubscriptionBilling({
      ...this.props,
      cancelAtPeriodEnd: false,
    });
  }

  /**
   * Returns billing props for persistence
   */
  toPersistence(): SubscriptionBillingProps {
    return { ...this.props };
  }
}
