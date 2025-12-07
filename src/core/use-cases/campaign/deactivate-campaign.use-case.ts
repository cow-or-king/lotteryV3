/**
 * DeactivateCampaign Use Case
 * Cas d'usage: Désactiver une campagne
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { CampaignRepository } from '@/core/ports/campaign.repository';
import type { CampaignEntity } from '@/core/entities/campaign.entity';

export interface DeactivateCampaignInput {
  id: string;
}

export interface DeactivateCampaignOutput {
  campaign: CampaignEntity;
}

export class DeactivateCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(input: DeactivateCampaignInput): Promise<Result<DeactivateCampaignOutput>> {
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

    // Vérifier que la campagne est active
    if (!campaign.isActive) {
      return fail('Campaign is already inactive');
    }

    // Désactiver la campagne
    const updatedCampaign: CampaignEntity = {
      ...campaign,
      isActive: false,
      updatedAt: new Date(),
    };

    const saveResult = await this.campaignRepository.save(updatedCampaign);

    if (!saveResult.success) {
      return fail(saveResult.error);
    }

    return ok({
      campaign: saveResult.value,
    });
  }
}
