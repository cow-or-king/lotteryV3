/**
 * ListWinners Use Case
 * Cas d'usage: Lister les gagnants d'une campagne
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/lib/types/result.type';
import { ok, fail } from '@/lib/types/result.type';
import type { IWinnerRepository } from '@/core/ports/winner.repository';
import type { WinnerEntity } from '@/core/entities/winner.entity';

export interface ListWinnersInput {
  campaignId?: string;
  status?: 'PENDING' | 'CLAIMED' | 'EXPIRED';
}

export interface ListWinnersOutput {
  winners: WinnerEntity[];
  total: number;
  pendingCount: number;
  claimedCount: number;
  expiredCount: number;
}

export class ListWinnersUseCase {
  constructor(private readonly winnerRepository: IWinnerRepository) {}

  async execute(input: ListWinnersInput): Promise<Result<ListWinnersOutput>> {
    let winners: WinnerEntity[] = [];

    // Récupérer les gagnants selon les filtres
    if (input.campaignId) {
      winners = await this.winnerRepository.findByCampaign(
        input.campaignId as string & { readonly __brand: unique symbol },
      );
    } else {
      // If no campaign ID, we can't list all winners - this should be handled at the router level
      return fail(new Error('Campaign ID is required'));
    }

    // Filtrer par statut si demandé
    if (input.status) {
      winners = winners.filter((w) => w.status === input.status);
    }

    // Calculer les statistiques
    const pendingCount = winners.filter((w) => w.status === 'PENDING').length;
    const claimedCount = winners.filter((w) => w.status === 'CLAIMED').length;
    const expiredCount = winners.filter((w) => w.status === 'EXPIRED').length;

    return ok({
      winners,
      total: winners.length,
      pendingCount,
      claimedCount,
      expiredCount,
    });
  }
}
