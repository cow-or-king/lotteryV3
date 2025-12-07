/**
 * User Entity - Core Domain Logic
 * RÈGLES STRICTES:
 * - ✅ AUCUN type 'any'
 * - ✅ AUCUNE dépendance externe
 * - ✅ Result Pattern pour toutes les erreurs
 * - ✅ Branded Types pour tous les IDs
 * - ✅ Types explicites partout
 */

import { Result } from '@/shared/types/result.type';
import { UserId, Email, StoreId, SubscriptionId } from '@/shared/types/branded.type';

// Domain Errors
export class InvalidUserDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUserDataError';
  }
}

export class UserSubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserSubscriptionError';
  }
}

// Value Objects
export interface UserSubscription {
  readonly id: SubscriptionId;
  readonly plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  readonly status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING';
  readonly storesLimit: number;
  readonly campaignsLimit: number;
  readonly currentPeriodEnd: Date;
}

export interface CreateUserProps {
  readonly id?: UserId | undefined; // Optional: use Supabase ID if provided
  readonly email: string;
  readonly password?: string | undefined;
  readonly hashedPassword?: string | undefined;
  readonly name?: string | undefined;
  readonly avatarUrl?: string | undefined;
  readonly acceptedTerms?: boolean | undefined;
}

export interface UserProps {
  readonly id: UserId;
  readonly email: Email;
  readonly emailVerified: boolean;
  readonly name: string | null;
  readonly avatarUrl: string | null;
  readonly hashedPassword: string | null;
  readonly subscription: UserSubscription | null;
  readonly stores: ReadonlyArray<StoreId>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * User Entity
 * Encapsule toute la logique métier liée aux utilisateurs
 */
export class UserEntity {
  private constructor(private readonly props: UserProps) {}

  // Factory Methods
  static create(props: CreateUserProps): Result<UserEntity> {
    // Validation
    if (props.acceptedTerms !== undefined && !props.acceptedTerms) {
      return Result.fail(new InvalidUserDataError('User must accept terms'));
    }

    if (!this.isValidEmail(props.email)) {
      return Result.fail(new InvalidUserDataError('Invalid email format'));
    }

    // Only validate password if provided (not needed for Supabase auth)
    if (props.password && !this.isValidPassword(props.password)) {
      return Result.fail(new InvalidUserDataError('Password must be at least 8 characters'));
    }

    const now = new Date();
    const userId = props.id ?? this.generateUserId();

    const user = new UserEntity({
      id: userId,
      email: props.email as Email,
      emailVerified: false,
      name: props.name ?? null,
      avatarUrl: props.avatarUrl ?? null,
      hashedPassword: props.hashedPassword ?? null, // Managed by Supabase
      subscription: null,
      stores: [],
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok(user);
  }

  static fromPersistence(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  // Getters
  get id(): UserId {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get name(): string | null {
    return this.props.name;
  }

  get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }

  get hashedPassword(): string | null {
    return this.props.hashedPassword;
  }

  get subscription(): UserSubscription | null {
    return this.props.subscription;
  }

  get stores(): ReadonlyArray<StoreId> {
    return this.props.stores;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Logic
  canCreateStore(): boolean {
    if (this.props.subscription === null) {
      return this.props.stores.length < 1; // Free tier: 1 store
    }

    return this.props.stores.length < this.props.subscription.storesLimit;
  }

  canCreateCampaign(): boolean {
    if (this.props.subscription === null) {
      return false; // Free tier: no campaigns
    }

    return (
      this.props.subscription.status === 'ACTIVE' || this.props.subscription.status === 'TRIALING'
    );
  }

  upgradeSubscription(newPlan: UserSubscription['plan']): Result<void> {
    const currentPlan = this.props.subscription?.plan ?? 'FREE';

    if (!this.canUpgradeTo(currentPlan, newPlan)) {
      return Result.fail(
        new UserSubscriptionError(`Cannot upgrade from ${currentPlan} to ${newPlan}`),
      );
    }

    // Logic would update the subscription
    return Result.ok(undefined);
  }

  verifyEmail(): Result<UserEntity> {
    if (this.props.emailVerified) {
      return Result.fail(new InvalidUserDataError('Email already verified'));
    }

    const updatedUser = new UserEntity({
      ...this.props,
      emailVerified: true,
      updatedAt: new Date(),
    });

    return Result.ok(updatedUser);
  }

  addStore(storeId: StoreId): Result<UserEntity> {
    if (!this.canCreateStore()) {
      return Result.fail(new UserSubscriptionError('Store limit reached for current plan'));
    }

    if (this.props.stores.includes(storeId)) {
      return Result.fail(new InvalidUserDataError('Store already associated with user'));
    }

    const updatedUser = new UserEntity({
      ...this.props,
      stores: [...this.props.stores, storeId],
      updatedAt: new Date(),
    });

    return Result.ok(updatedUser);
  }

  removeStore(storeId: StoreId): Result<UserEntity> {
    if (!this.props.stores.includes(storeId)) {
      return Result.fail(new InvalidUserDataError('Store not associated with user'));
    }

    const updatedUser = new UserEntity({
      ...this.props,
      stores: this.props.stores.filter((id) => id !== storeId),
      updatedAt: new Date(),
    });

    return Result.ok(updatedUser);
  }

  // Private Helpers
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPassword(password: string): boolean {
    return password.length >= 8;
  }

  private static generateUserId(): UserId {
    // In real app, this would use a proper ID generator
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as UserId;
  }

  private canUpgradeTo(from: UserSubscription['plan'], to: UserSubscription['plan']): boolean {
    const planHierarchy = {
      FREE: 0,
      STARTER: 1,
      PRO: 2,
      ENTERPRISE: 3,
    };

    return planHierarchy[to] > planHierarchy[from];
  }

  // Serialization
  toPersistence(): UserProps {
    return {
      ...this.props,
    };
  }
}
