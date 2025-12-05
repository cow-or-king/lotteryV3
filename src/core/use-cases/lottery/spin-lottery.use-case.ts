/**
 * Spin Lottery Use Case
 * Gère le tirage de la loterie pour un participant
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/shared/types/result.type';
import { CampaignId, PrizeId, WinnerId } from '@/shared/types/branded.type';
import { Email } from '@/core/value-objects/email.vo';
import { ClaimCode } from '@/core/value-objects/claim-code.vo';
import { ICampaignRepository } from '@/core/repositories/campaign.repository.interface';
import { IPrizeRepository } from '@/core/repositories/prize.repository.interface';
import { IParticipantRepository } from '@/core/repositories/participant.repository.interface';
import { IWinnerRepository } from '@/core/repositories/winner.repository.interface';

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
    const emailResult = Email.create(input.email);
    if (!emailResult.success) {
      return Result.fail(emailResult.error);
    }
    const email = emailResult.data;

    // 2. Vérifier que la campagne existe et est active
    const campaign = await this.campaignRepository.findById(input.campaignId);
    if (!campaign) {
      return Result.fail(new CampaignNotFoundError(input.campaignId));
    }

    if (!campaign.isRunning()) {
      return Result.fail(new CampaignNotActiveError());
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
    if (!selectedPrize) {
      return Result.fail(new NoPrizesAvailableError());
    }

    // 6. Vérifier que le prix est disponible
    if (!selectedPrize.isAvailable()) {
      return Result.fail(new NoPrizesAvailableError());
    }

    // 7. Transaction: Attribuer le prix
    try {
      // Marquer le participant comme ayant joué
      const markPlayedResult = await this.participantRepository.markAsPlayed(
        participant.id,
        new Date(),
      );

      if (!markPlayedResult.success) {
        return Result.fail(new LotteryDrawError('Failed to mark participant as played'));
      }

      // Décrémenter le stock du prix (atomique)
      const decrementResult = await this.prizeRepository.decrementStock(selectedPrize.id);
      if (!decrementResult.success) {
        return Result.fail(new LotteryDrawError('Failed to decrement prize stock'));
      }

      // Créer le gagnant avec code de réclamation
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Expire dans 30 jours

      const winnerResult = await this.winnerRepository.create({
        prizeId: selectedPrize.id,
        participantEmail: email,
        participantName: input.name,
        expiresAt,
      });

      if (!winnerResult.success) {
        // Rollback: restaurer le stock
        await this.prizeRepository.incrementStock(selectedPrize.id);
        return Result.fail(new LotteryDrawError('Failed to create winner record'));
      }

      const winner = winnerResult.data;

      // 8. Calculer la durée de rotation de la roue
      // Plus le prix a de valeur, plus la roue tourne longtemps
      const baseSpinDuration = 3000; // 3 secondes minimum
      const valueBonus = selectedPrize.value ? selectedPrize.value.amount * 10 : 0;
      const wheelSpinDuration = Math.min(baseSpinDuration + valueBonus, 8000); // Max 8 secondes

      // 9. Retourner le résultat
      return Result.ok({
        winnerId: winner.id,
        prizeId: selectedPrize.id,
        prizeName: selectedPrize.name,
        prizeDescription: selectedPrize.description,
        prizeValue: selectedPrize.value?.amount ?? null,
        claimCode: winner.claimCode.value,
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
