/**
 * DeleteCampaign Use Case
 * Cas d'usage: Supprimer une campagne
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { CampaignRepository } from '@/core/ports/campaign.repository';

export interface DeleteCampaignInput {
  id: string;
}

export interface DeleteCampaignOutput {
  success: boolean;
}

export class DeleteCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(input: DeleteCampaignInput): Promise<Result<DeleteCampaignOutput>> {
    // Validation de l'ID
    if (!input.id || input.id.trim().length === 0) {
      return fail('Campaign ID is required');
    }

    // Vérifier que la campagne existe
    const campaignResult = await this.campaignRepository.findById(input.id);

    if (!campaignResult.success) {
      return fail(campaignResult.error);
    }

    if (!campaignResult.value) {
      return fail('Campaign not found');
    }

    // Vérifier que la campagne n'est pas active
    if (campaignResult.value.isActive) {
      return fail('Cannot delete an active campaign. Please deactivate it first.');
    }

    // Supprimer la campagne
    const deleteResult = await this.campaignRepository.delete(input.id);

    if (!deleteResult.success) {
      return fail(deleteResult.error);
    }

    return ok({
      success: true,
    });
  }
}
