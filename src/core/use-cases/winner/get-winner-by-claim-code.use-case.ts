/**
 * GetWinnerByClaimCode Use Case
 * Cas d'usage: Récupérer un gagnant par son code de réclamation
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/lib/types/result.type';
import { ok, fail } from '@/lib/types/result.type';
import type { IWinnerRepository } from '@/core/ports/winner.repository';
import type { WinnerEntity } from '@/core/entities/winner.entity';
import { ClaimCode } from '@/core/value-objects/claim-code.vo';

export interface GetWinnerByClaimCodeInput {
  claimCode: string;
}

export interface GetWinnerByClaimCodeOutput {
  winner: WinnerEntity;
  isExpired: boolean;
  isClaimed: boolean;
}

export class GetWinnerByClaimCodeUseCase {
  constructor(private readonly winnerRepository: IWinnerRepository) {}

  async execute(input: GetWinnerByClaimCodeInput): Promise<Result<GetWinnerByClaimCodeOutput>> {
    // Validation du code
    if (!input.claimCode || input.claimCode.trim().length === 0) {
      return fail(new Error('Claim code is required'));
    }

    // Create ClaimCode value object
    const claimCodeResult = ClaimCode.create(input.claimCode);
    if (!claimCodeResult.success) {
      return fail(new Error('Invalid claim code format'));
    }

    // Récupérer le gagnant
    const winner = await this.winnerRepository.findByClaimCode(claimCodeResult.data);

    if (!winner) {
      return fail(new Error('Invalid claim code'));
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
