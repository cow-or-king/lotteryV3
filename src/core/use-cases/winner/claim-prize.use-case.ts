/**
 * ClaimPrize Use Case
 * Cas d'usage: Réclamer un gain avec un code
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/lib/types/result.type';
import { ok, fail } from '@/lib/types/result.type';
import type { IWinnerRepository } from '@/core/ports/winner.repository';
import type { WinnerEntity } from '@/core/entities/winner.entity';
import { ClaimCode } from '@/core/value-objects/claim-code.vo';

export interface ClaimPrizeInput {
  claimCode: string;
}

export interface ClaimPrizeOutput {
  winner: WinnerEntity;
  message: string;
}

export class ClaimPrizeUseCase {
  constructor(private readonly winnerRepository: IWinnerRepository) {}

  async execute(input: ClaimPrizeInput): Promise<Result<ClaimPrizeOutput>> {
    // Validation du code
    if (!input.claimCode || input.claimCode.trim().length === 0) {
      return fail(new Error('Claim code is required'));
    }

    // Create ClaimCode value object
    const claimCodeResult = ClaimCode.create(input.claimCode);
    if (!claimCodeResult.success) {
      return fail(new Error('Invalid claim code format'));
    }

    // Récupérer le gagnant par le code
    const winner = await this.winnerRepository.findByClaimCode(claimCodeResult.data);

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
      const expireResult = await this.winnerRepository.expire(winner.id);

      if (!expireResult.success) {
        return fail(expireResult.error);
      }

      return fail(new Error('This prize has expired'));
    }

    // Marquer le gain comme réclamé
    const claimResult = await this.winnerRepository.claim(winner.id, now);

    if (!claimResult.success) {
      return fail(claimResult.error);
    }

    return ok({
      winner: {
        ...winner,
        status: 'CLAIMED',
        claimedAt: now,
      },
      message: 'Prize successfully claimed! Please show this confirmation to the merchant.',
    });
  }
}
