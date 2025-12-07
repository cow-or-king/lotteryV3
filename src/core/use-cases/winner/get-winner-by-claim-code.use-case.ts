/**
 * GetWinnerByClaimCode Use Case
 * Cas d'usage: Récupérer un gagnant par son code de réclamation
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { WinnerRepository } from '@/core/ports/winner.repository';
import type { WinnerEntity } from '@/core/entities/winner.entity';

export interface GetWinnerByClaimCodeInput {
  claimCode: string;
}

export interface GetWinnerByClaimCodeOutput {
  winner: WinnerEntity;
  isExpired: boolean;
  isClaimed: boolean;
}

export class GetWinnerByClaimCodeUseCase {
  constructor(private readonly winnerRepository: WinnerRepository) {}

  async execute(input: GetWinnerByClaimCodeInput): Promise<Result<GetWinnerByClaimCodeOutput>> {
    // Validation du code
    if (!input.claimCode || input.claimCode.trim().length === 0) {
      return fail('Claim code is required');
    }

    // Récupérer le gagnant
    const winnerResult = await this.winnerRepository.findByClaimCode(
      input.claimCode.trim().toUpperCase(),
    );

    if (!winnerResult.success) {
      return fail(winnerResult.error);
    }

    const winner = winnerResult.value;

    if (!winner) {
      return fail('Invalid claim code');
    }

    // Vérifier le statut
    const now = new Date();
    const isExpired = winner.expiresAt < now || winner.status === 'EXPIRED';
    const isClaimed = winner.status === 'CLAIMED';

    return ok({
      winner,
      isExpired,
      isClaimed,
    });
  }
}
