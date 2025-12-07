/**
 * ActivateCampaign Use Case
 * Cas d'usage: Activer une campagne
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { CampaignRepository } from '@/core/ports/campaign.repository';
import type { CampaignEntity } from '@/core/entities/campaign.entity';

export interface ActivateCampaignInput {
  id: string;
}

export interface ActivateCampaignOutput {
  campaign: CampaignEntity;
}

export class ActivateCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(input: ActivateCampaignInput): Promise<Result<ActivateCampaignOutput>> {
    // Validation de l'ID
    if (!input.id || input.id.trim().length === 0) {
      return fail(new Error('Campaign ID is required'));
    }

    // Récupérer la campagne
    const campaignResult = await this.campaignRepository.findById(input.id);

    if (!campaignResult.success) {
      return fail(campaignResult.error);
    }

    const campaign = campaignResult.value;

    if (!campaign) {
      return fail(new Error('Campaign not found'));
    }

    // Vérifier que la campagne n'est pas déjà active
    if (campaign.isActive) {
      return fail(new Error('Campaign is already active'));
    }

    // Vérifier que les dates sont valides
    const now = new Date();
    if (campaign.endDate < now) {
      return fail(new Error('Cannot activate a campaign that has already ended'));
    }

    // Activer la campagne
    const updatedCampaign: CampaignEntity = {
      ...campaign,
      isActive: true,
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
