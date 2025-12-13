/**
 * Campaign Rewards Value Object
 * Encapsulates prize management logic
 * RÈGLES STRICTES:
 * - ✅ AUCUN type 'any'
 * - ✅ AUCUNE dépendance externe
 * - ✅ Immutable value object
 */

import { Result } from '@/lib/types/result.type';
import { PrizeId } from '@/lib/types/branded.type';
import { CampaignOperationError } from '../entities/campaign.entity';

/**
 * CampaignRewards Value Object
 * Gère les prix associés à une campagne
 */
export class CampaignRewards {
  private constructor(private readonly prizes: ReadonlyArray<PrizeId>) {}

  static create(prizes: ReadonlyArray<PrizeId> = []): CampaignRewards {
    return new CampaignRewards(prizes);
  }

  get prizeIds(): ReadonlyArray<PrizeId> {
    return this.prizes;
  }

  get count(): number {
    return this.prizes.length;
  }

  /**
   * Checks if campaign has any prizes
   */
  hasPrizes(): boolean {
    return this.prizes.length > 0;
  }

  /**
   * Checks if a specific prize is associated
   */
  hasPrize(prizeId: PrizeId): boolean {
    return this.prizes.includes(prizeId);
  }

  /**
   * Adds a prize to the campaign
   */
  addPrize(prizeId: PrizeId): Result<CampaignRewards> {
    if (this.hasPrize(prizeId)) {
      return Result.fail(new CampaignOperationError('Prize already associated with campaign'));
    }

    return Result.ok(new CampaignRewards([...this.prizes, prizeId]));
  }

  /**
   * Removes a prize from the campaign
   */
  removePrize(prizeId: PrizeId): Result<CampaignRewards> {
    if (!this.hasPrize(prizeId)) {
      return Result.fail(new CampaignOperationError('Prize not associated with campaign'));
    }

    return Result.ok(new CampaignRewards(this.prizes.filter((id) => id !== prizeId)));
  }

  toPersistence(): ReadonlyArray<PrizeId> {
    return [...this.prizes];
  }
}
