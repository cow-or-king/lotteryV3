/**
 * Spin Lottery Use Case
 * Gère le tirage de la loterie pour un participant
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/lib/types/result.type';
import { CampaignId, PrizeId, WinnerId } from '@/lib/types/branded.type';
import { Email } from '@/core/value-objects/email.vo';
import { ICampaignRepository } from '@/core/repositories/campaign.repository.interface';
import { IPrizeRepository } from '@/core/repositories/prize.repository.interface';
import { IParticipantRepository } from '@/core/repositories/participant.repository.interface';
import { IWinnerRepository } from '@/core/repositories/winner.repository.interface';
import { CampaignEntity } from '@/core/entities/campaign.entity';
import { PrizeEntity } from '@/core/entities/prize.entity';

// DTO pour l'input
export interface SpinLotteryInput {
  readonly email: string;
  readonly name?: string;
  readonly phone?: string;
  readonly campaignId: CampaignId;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

// DTO pour l'output
export interface SpinLotteryOutput {
  readonly winnerId: WinnerId;
  readonly prizeId: PrizeId;
  readonly prizeName: string;
  readonly prizeDescription: string | null;
  readonly prizeValue: number | null; // en euros
  readonly claimCode: string;
  readonly expiresAt: Date;
  readonly wheelSpinDuration: number; // durée de rotation en ms
}

// Domain Errors
export class CampaignNotFoundError extends Error {
  constructor(campaignId: CampaignId) {
    super(`Campaign ${campaignId} not found`);
    this.name = 'CampaignNotFoundError';
  }
}

export class CampaignNotActiveError extends Error {
  constructor() {
    super('Campaign is not active');
    this.name = 'CampaignNotActiveError';
  }
}

export class AlreadyParticipatedError extends Error {
  constructor() {
    super('You have already participated in this campaign');
    this.name = 'AlreadyParticipatedError';
  }
}

export class NoPrizesAvailableError extends Error {
  constructor() {
    super('No prizes are available');
    this.name = 'NoPrizesAvailableError';
  }
}

export class LotteryDrawError extends Error {
  constructor(message: string) {
    super(`Lottery draw failed: ${message}`);
    this.name = 'LotteryDrawError';
  }
}

// ========================================
// Module-level helper functions
// ========================================

/**
 * Validates email and returns Email value object
 */
function validateEmail(emailString: string): Result<Email> {
  return Email.create(emailString);
}

/**
 * Validates that campaign exists and is running
 */
function validateCampaign(
  campaign: CampaignEntity | null,
  campaignId: CampaignId,
): Result<CampaignEntity> {
  if (!campaign) {
    return Result.fail(new CampaignNotFoundError(campaignId));
  }
  if (!campaign.isRunning()) {
    return Result.fail(new CampaignNotActiveError());
  }
  return Result.ok(campaign);
}

/**
 * Validates that prize is available
 */
function validatePrize(prize: PrizeEntity | null): Result<PrizeEntity> {
  if (!prize) {
    return Result.fail(new NoPrizesAvailableError());
  }
  if (!prize.isAvailable()) {
    return Result.fail(new NoPrizesAvailableError());
  }
  return Result.ok(prize);
}

/**
 * Calculates wheel spin duration based on prize value
 */
function calculateWheelSpinDuration(prizeValue: number | undefined): number {
  const baseSpinDuration = 3000; // 3 seconds minimum
  const valueBonus = prizeValue ? prizeValue * 10 : 0;
  return Math.min(baseSpinDuration + valueBonus, 8000); // Max 8 seconds
}

/**
 * Creates expiration date (30 days from now)
 */
function createExpirationDate(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  return expiresAt;
}

/**
 * Use Case: Spin Lottery
 */
export class SpinLotteryUseCase {
  constructor(
    private readonly campaignRepository: ICampaignRepository,
    private readonly prizeRepository: IPrizeRepository,
    private readonly participantRepository: IParticipantRepository,
    private readonly winnerRepository: IWinnerRepository,
  ) {}

  async execute(input: SpinLotteryInput): Promise<Result<SpinLotteryOutput>> {
    // 1. Valider l'email
    const emailResult = validateEmail(input.email);
    if (!emailResult.success) {
      return Result.fail(emailResult.error);
    }
    const email = emailResult.data;

    // 2. Vérifier que la campagne existe et est active
    const campaign = await this.campaignRepository.findById(input.campaignId);
    const campaignValidation = validateCampaign(campaign, input.campaignId);
    if (!campaignValidation.success) {
      return Result.fail(campaignValidation.error);
    }

    // 3. Vérifier que le participant n'a pas déjà joué
    const hasParticipated = await this.participantRepository.hasParticipated(
      email,
      input.campaignId,
    );
    if (hasParticipated) {
      return Result.fail(new AlreadyParticipatedError());
    }

    // 4. Créer ou mettre à jour le participant
    const participantResult = await this.participantRepository.create({
      email,
      name: input.name,
      phone: input.phone,
      campaignId: input.campaignId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
    if (!participantResult.success) {
      return Result.fail(new LotteryDrawError('Failed to register participant'));
    }
    const participant = participantResult.data;

    // 5. Sélectionner un prix basé sur les probabilités
    const selectedPrize = await this.prizeRepository.selectPrizeByProbability(input.campaignId);
    const prizeValidation = validatePrize(selectedPrize);
    if (!prizeValidation.success) {
      return Result.fail(prizeValidation.error);
    }
    const prize = prizeValidation.data;

    // 6. Transaction: Attribuer le prix
    try {
      const markPlayedResult = await this.participantRepository.markAsPlayed(
        participant.id,
        new Date(),
      );
      if (!markPlayedResult.success) {
        return Result.fail(new LotteryDrawError('Failed to mark participant as played'));
      }

      const decrementResult = await this.prizeRepository.decrementStock(prize.id);
      if (!decrementResult.success) {
        return Result.fail(new LotteryDrawError('Failed to decrement prize stock'));
      }

      const winnerResult = await this.winnerRepository.create({
        prizeId: prize.id,
        participantEmail: email,
        participantName: input.name,
        expiresAt: createExpirationDate(),
      });

      if (!winnerResult.success) {
        await this.prizeRepository.incrementStock(prize.id);
        return Result.fail(new LotteryDrawError('Failed to create winner record'));
      }

      const winner = winnerResult.data;
      const wheelSpinDuration = calculateWheelSpinDuration(prize.value?.getAmount());

      return Result.ok({
        winnerId: winner.id,
        prizeId: prize.id,
        prizeName: prize.name,
        prizeDescription: prize.description,
        prizeValue: prize.value?.getAmount() ?? null,
        claimCode: winner.claimCode.getValue(),
        expiresAt: winner.expiresAt,
        wheelSpinDuration,
      });
    } catch (error) {
      return Result.fail(
        new LotteryDrawError(error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }
}
