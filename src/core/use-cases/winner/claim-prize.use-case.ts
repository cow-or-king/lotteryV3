/**
 * ClaimPrize Use Case
 * Cas d'usage: Réclamer un gain avec un code
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { WinnerRepository } from '@/core/ports/winner.repository';
import type { WinnerEntity } from '@/core/entities/winner.entity';

export interface ClaimPrizeInput {
  claimCode: string;
}

export interface ClaimPrizeOutput {
  winner: WinnerEntity;
  message: string;
}

export class ClaimPrizeUseCase {
  constructor(private readonly winnerRepository: WinnerRepository) {}

  async execute(input: ClaimPrizeInput): Promise<Result<ClaimPrizeOutput>> {
    // Validation du code
    if (!input.claimCode || input.claimCode.trim().length === 0) {
      return fail(new Error('Claim code is required'));
    }

    // Récupérer le gagnant par le code
    const winnerResult = await this.winnerRepository.findByClaimCode(
      input.claimCode.trim().toUpperCase(),
    );

    if (!winnerResult.success) {
      return fail(winnerResult.error);
    }

    const winner = winnerResult.value;

    if (!winner) {
      return fail(new Error('Invalid claim code'));
    }

    // Vérifier que le gain n'a pas déjà été réclamé
    if (winner.status === 'CLAIMED') {
      return fail(new Error('This prize has already been claimed'));
    }

    // Vérifier que le gain n'a pas expiré
    const now = new Date();
    if (winner.expiresAt < now) {
      // Marquer comme expiré
      const expiredWinner: WinnerEntity = {
        ...winner,
        status: 'EXPIRED',
      };

      await this.winnerRepository.save(expiredWinner);

      return fail(new Error('This prize has expired'));
    }

    // Marquer le gain comme réclamé
    const claimedWinner: WinnerEntity = {
      ...winner,
      status: 'CLAIMED',
      claimedAt: now,
    };

    const saveResult = await this.winnerRepository.save(claimedWinner);

    if (!saveResult.success) {
      return fail(saveResult.error);
    }

    return ok({
      winner: saveResult.value,
      message: 'Prize successfully claimed! Please show this confirmation to the merchant.',
    });
  }
}
