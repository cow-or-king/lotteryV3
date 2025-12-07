/**
 * DeleteCampaign Use Case
 * Cas d'usage: Supprimer une campagne
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { CampaignRepository } from '@/core/ports/campaign.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface DeleteCampaignInput {
  id: string;
  userId: string; // L'utilisateur qui fait la requête
}

export interface DeleteCampaignOutput {
  success: boolean;
}

export class DeleteCampaignUseCase {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(input: DeleteCampaignInput): Promise<Result<DeleteCampaignOutput>> {
    // Validation de l'ID
    if (!input.id || input.id.trim().length === 0) {
      return fail(new Error('Campaign ID is required'));
    }

    // Validation du userId
    if (!input.userId || input.userId.trim().length === 0) {
      return fail(new Error('User ID is required'));
    }

    // Vérifier que la campagne existe
    const campaignResult = await this.campaignRepository.findById(input.id);

    if (!campaignResult.success) {
      return fail(campaignResult.error);
    }

    if (!campaignResult.value) {
      return fail(new Error('Campaign not found'));
    }

    const campaign = campaignResult.value;

    // Vérifier que l'utilisateur est le propriétaire de la brand
    const brandResult = await this.brandRepository.findById(campaign.brandId);

    if (!brandResult.success) {
      return fail(brandResult.error);
    }

    const brand = brandResult.value;

    if (!brand) {
      return fail(new Error('Brand not found'));
    }

    if (brand.ownerId !== input.userId) {
      return fail(new Error('You do not have permission to delete this campaign'));
    }

    // Vérifier que la campagne n'est pas active
    if (campaign.isActive) {
      return fail(new Error('Cannot delete an active campaign. Please deactivate it first.'));
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
