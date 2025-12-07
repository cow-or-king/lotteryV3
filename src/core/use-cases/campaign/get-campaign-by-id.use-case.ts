/**
 * GetCampaignById Use Case
 * Cas d'usage: Récupérer une campagne par son ID
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { CampaignRepository } from '@/core/ports/campaign.repository';
import type { CampaignEntity } from '@/core/entities/campaign.entity';

export interface GetCampaignByIdInput {
  id: string;
}

export interface GetCampaignByIdOutput {
  campaign: CampaignEntity;
}

export class GetCampaignByIdUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(input: GetCampaignByIdInput): Promise<Result<GetCampaignByIdOutput>> {
    // Validation de l'ID
    if (!input.id || input.id.trim().length === 0) {
      return fail('Campaign ID is required');
    }

    // Récupérer la campagne
    const campaignResult = await this.campaignRepository.findById(input.id);

    if (!campaignResult.success) {
      return fail(campaignResult.error);
    }

    const campaign = campaignResult.value;

    if (!campaign) {
      return fail('Campaign not found');
    }

    return ok({
      campaign,
    });
  }
}
