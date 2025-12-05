/**
 * Create Campaign Use Case
 * Gère la création d'une nouvelle campagne
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/shared/types/result.type';
import { CampaignId, StoreId, UserId, PrizeId } from '@/shared/types/branded.type';
import { CampaignEntity } from '@/core/entities/campaign.entity';
import { PrizeEntity } from '@/core/entities/prize.entity';
import { ICampaignRepository } from '@/core/repositories/campaign.repository.interface';
import { IStoreRepository } from '@/core/repositories/store.repository.interface';
import { IPrizeRepository } from '@/core/repositories/prize.repository.interface';
import { ISubscriptionRepository } from '@/core/repositories/subscription.repository.interface';

// DTO pour un prix
export interface PrizeInput {
  readonly name: string;
  readonly description?: string;
  readonly value?: number;
  readonly color: string;
  readonly probability: number;
  readonly quantity: number;
}

// DTO pour l'input
export interface CreateCampaignInput {
  readonly name: string;
  readonly description?: string;
  readonly storeId: StoreId;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly prizes: PrizeInput[];
  readonly wheelStyle?: 'classic' | 'modern' | 'elegant';
  readonly wheelAnimation?: 'spin' | 'bounce' | 'smooth';
  readonly userId: UserId; // Pour vérifier les permissions
}

// DTO pour l'output
export interface CreateCampaignOutput {
  readonly campaignId: CampaignId;
  readonly name: string;
  readonly storeId: StoreId;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly isActive: boolean;
  readonly prizeIds: PrizeId[];
}

// Domain Errors
export class StoreNotFoundError extends Error {
  constructor(storeId: StoreId) {
    super(`Store ${storeId} not found`);
    this.name = 'StoreNotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class CampaignLimitExceededError extends Error {
  constructor(limit: number) {
    super(`Campaign creation limit exceeded. Maximum ${limit} campaigns allowed.`);
    this.name = 'CampaignLimitExceededError';
  }
}

export class InvalidPrizesError extends Error {
  constructor(message: string) {
    super(`Invalid prizes: ${message}`);
    this.name = 'InvalidPrizesError';
  }
}

/**
 * Use Case: Create Campaign
 */
export class CreateCampaignUseCase {
  constructor(
    private readonly campaignRepository: ICampaignRepository,
    private readonly storeRepository: IStoreRepository,
    private readonly prizeRepository: IPrizeRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(input: CreateCampaignInput): Promise<Result<CreateCampaignOutput>> {
    // 1. Vérifier que le store existe
    const store = await this.storeRepository.findById(input.storeId);
    if (!store) {
      return Result.fail(new StoreNotFoundError(input.storeId));
    }

    // 2. Vérifier que l'utilisateur est propriétaire du store
    if (store.ownerId !== input.userId) {
      return Result.fail(new UnauthorizedError('User is not the owner of this store'));
    }

    // 3. Vérifier que le store peut créer une campagne
    if (!store.canCreateCampaign()) {
      return Result.fail(
        new UnauthorizedError('Store cannot create campaigns (inactive or unpaid)'),
      );
    }

    // 4. Vérifier les limites de l'abonnement
    const subscription = await this.subscriptionRepository.findByUser(input.userId);
    if (!subscription) {
      return Result.fail(new Error('No subscription found for user'));
    }

    // Pour FREE plan, vérifier qu'il n'y a pas déjà de campagnes
    if (subscription.plan === 'FREE') {
      const existingCampaigns = await this.campaignRepository.findByStore(input.storeId);
      if (existingCampaigns.length >= subscription.campaignsLimit) {
        return Result.fail(new CampaignLimitExceededError(subscription.campaignsLimit));
      }
    }

    // 5. Valider les prix
    if (!input.prizes || input.prizes.length === 0) {
      return Result.fail(new InvalidPrizesError('At least one prize is required'));
    }

    // Vérifier que la somme des probabilités est valide (proche de 1.0)
    const totalProbability = input.prizes.reduce((sum, prize) => sum + prize.probability, 0);
    if (Math.abs(totalProbability - 1.0) > 0.01) {
      return Result.fail(
        new InvalidPrizesError(`Total probability must equal 1.0 (got ${totalProbability})`),
      );
    }

    // 6. Créer l'entité Campaign
    const campaignResult = CampaignEntity.create({
      name: input.name,
      description: input.description,
      storeId: input.storeId,
      startDate: input.startDate,
      endDate: input.endDate,
      wheelStyle: input.wheelStyle,
      wheelAnimation: input.wheelAnimation,
    });

    if (!campaignResult.success) {
      return Result.fail(campaignResult.error);
    }

    const campaign = campaignResult.data;

    // 7. Créer les entités Prize
    const prizeResults: PrizeEntity[] = [];
    for (const prizeInput of input.prizes) {
      const prizeResult = PrizeEntity.create({
        name: prizeInput.name,
        description: prizeInput.description,
        value: prizeInput.value,
        color: prizeInput.color,
        probability: prizeInput.probability,
        quantity: prizeInput.quantity,
        campaignId: campaign.id,
      });

      if (!prizeResult.success) {
        return Result.fail(new InvalidPrizesError(prizeResult.error.message));
      }

      prizeResults.push(prizeResult.data);
    }

    // 8. Transaction: Sauvegarder la campagne et les prix
    try {
      // Sauvegarder la campagne
      const saveCampaignResult = await this.campaignRepository.save(campaign);
      if (!saveCampaignResult.success) {
        return Result.fail(new Error('Failed to save campaign'));
      }

      // Sauvegarder les prix
      const savePrizesResult = await this.prizeRepository.saveMany(prizeResults);
      if (!savePrizesResult.success) {
        return Result.fail(new Error('Failed to save prizes'));
      }

      // Activer la campagne si elle doit commencer maintenant
      if (campaign.shouldBeActive()) {
        await this.campaignRepository.activate(campaign.id);
      }

      // 9. Retourner le résultat
      return Result.ok({
        campaignId: campaign.id,
        name: campaign.name,
        storeId: campaign.storeId,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        isActive: campaign.isActive,
        prizeIds: prizeResults.map((prize) => prize.id),
      });
    } catch (error) {
      return Result.fail(
        new Error(
          `Failed to create campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }
}
