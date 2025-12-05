/**
 * Create Store Use Case
 * Gère la création d'un nouveau store
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/shared/types/result.type';
import { StoreId, UserId } from '@/shared/types/branded.type';
import { StoreEntity } from '@/core/entities/store.entity';
import { IStoreRepository } from '@/core/repositories/store.repository.interface';
import { IUserRepository } from '@/core/repositories/user.repository.interface';
import { ISubscriptionRepository } from '@/core/repositories/subscription.repository.interface';

// DTO pour l'input
export interface CreateStoreInput {
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly ownerId: UserId;
  readonly googlePlaceId?: string;
  readonly googleBusinessUrl?: string;
  readonly logoUrl?: string;
  readonly primaryColor?: string;
  readonly secondaryColor?: string;
  readonly font?: string;
}

// DTO pour l'output
export interface CreateStoreOutput {
  readonly storeId: StoreId;
  readonly slug: string;
  readonly name: string;
  readonly isActive: boolean;
}

// Domain Errors
export class SlugAlreadyExistsError extends Error {
  constructor(slug: string) {
    super(`Slug ${slug} already exists`);
    this.name = 'SlugAlreadyExistsError';
  }
}

export class StoreCreationLimitExceededError extends Error {
  constructor(limit: number) {
    super(`Store creation limit exceeded. Maximum ${limit} stores allowed.`);
    this.name = 'StoreCreationLimitExceededError';
  }
}

export class UserNotFoundError extends Error {
  constructor(userId: UserId) {
    super(`User ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}

export class SubscriptionLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionLimitError';
  }
}

/**
 * Use Case: Create Store
 */
export class CreateStoreUseCase {
  constructor(
    private readonly storeRepository: IStoreRepository,
    private readonly userRepository: IUserRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(input: CreateStoreInput): Promise<Result<CreateStoreOutput>> {
    // 1. Vérifier que l'utilisateur existe
    const user = await this.userRepository.findById(input.ownerId);
    if (!user) {
      return Result.fail(new UserNotFoundError(input.ownerId));
    }

    // 2. Vérifier les limites de l'abonnement
    const subscription = await this.subscriptionRepository.findByUser(input.ownerId);
    if (!subscription) {
      return Result.fail(new Error('No subscription found for user'));
    }

    // Vérifier que l'abonnement est actif
    if (!subscription.isActive()) {
      return Result.fail(new SubscriptionLimitError('Subscription is not active'));
    }

    // Compter les stores existants de l'utilisateur
    const userStoresCount = await this.userRepository.countUserStores(input.ownerId);
    if (userStoresCount >= subscription.storesLimit) {
      return Result.fail(new StoreCreationLimitExceededError(subscription.storesLimit));
    }

    // 3. Vérifier que le slug est unique
    const slugExists = await this.storeRepository.slugExists(input.slug);
    if (slugExists) {
      return Result.fail(new SlugAlreadyExistsError(input.slug));
    }

    // 4. Créer l'entité Store
    const storeResult = StoreEntity.create({
      name: input.name,
      slug: input.slug,
      description: input.description,
      ownerId: input.ownerId,
      googlePlaceId: input.googlePlaceId,
      googleBusinessUrl: input.googleBusinessUrl,
      logoUrl: input.logoUrl,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      font: input.font,
      // Le store est payant si l'abonnement n'est pas FREE
      isPaid: subscription.plan !== 'FREE',
    });

    if (!storeResult.success) {
      return Result.fail(storeResult.error);
    }

    const store = storeResult.data;

    // 5. Sauvegarder le store
    const saveResult = await this.storeRepository.save(store);
    if (!saveResult.success) {
      return Result.fail(new Error('Failed to save store'));
    }

    // 6. Retourner le résultat
    return Result.ok({
      storeId: store.id,
      slug: store.slug,
      name: store.name,
      isActive: store.isActive,
    });
  }
}
