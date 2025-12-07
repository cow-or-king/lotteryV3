/**
 * UpdateCampaign Use Case
 * Cas d'usage: Mettre à jour une campagne existante
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { CampaignRepository } from '@/core/ports/campaign.repository';
import type { CampaignEntity } from '@/core/entities/campaign.entity';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface UpdateCampaignInput {
  id: string;
  userId: string; // L'utilisateur qui fait la requête
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  wheelStyle?: string;
  wheelAnimation?: string;
}

export interface UpdateCampaignOutput {
  campaign: CampaignEntity;
}

export class UpdateCampaignUseCase {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(input: UpdateCampaignInput): Promise<Result<UpdateCampaignOutput>> {
    // Validation de l'ID
    if (!input.id || input.id.trim().length === 0) {
      return fail(new Error('Campaign ID is required'));
    }

    // Validation du userId
    if (!input.userId || input.userId.trim().length === 0) {
      return fail(new Error('User ID is required'));
    }

    // Récupérer la campagne existante
    const existingCampaignResult = await this.campaignRepository.findById(input.id);

    if (!existingCampaignResult.success) {
      return fail(existingCampaignResult.error);
    }

    const existingCampaign = existingCampaignResult.value;

    if (!existingCampaign) {
      return fail(new Error('Campaign not found'));
    }

    // Vérifier que l'utilisateur est le propriétaire de la brand
    const brandResult = await this.brandRepository.findById(existingCampaign.brandId);

    if (!brandResult.success) {
      return fail(brandResult.error);
    }

    const brand = brandResult.data;

    if (!brand) {
      return fail(new Error('Brand not found'));
    }

    if (brand.ownerId !== input.userId) {
      return fail(new Error('You do not have permission to update this campaign'));
    }

    // Validation du nom si fourni
    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        return fail(new Error('Campaign name cannot be empty'));
      }

      if (input.name.trim().length < 2) {
        return fail(new Error('Campaign name must be at least 2 characters long'));
      }

      if (input.name.trim().length > 200) {
        return fail(new Error('Campaign name must be at most 200 characters long'));
      }
    }

    // Validation des dates si fournies
    if (input.startDate && input.endDate) {
      if (input.startDate >= input.endDate) {
        return fail(new Error('Start date must be before end date'));
      }
    }

    // Préparer les données mises à jour
    const updatedCampaign: CampaignEntity = {
      ...existingCampaign,
      name: input.name !== undefined ? input.name.trim() : existingCampaign.name,
      description:
        input.description !== undefined ? input.description : existingCampaign.description,
      startDate: input.startDate !== undefined ? input.startDate : existingCampaign.startDate,
      endDate: input.endDate !== undefined ? input.endDate : existingCampaign.endDate,
      wheelStyle: input.wheelStyle !== undefined ? input.wheelStyle : existingCampaign.wheelStyle,
      wheelAnimation:
        input.wheelAnimation !== undefined ? input.wheelAnimation : existingCampaign.wheelAnimation,
      updatedAt: new Date(),
    };

    // Sauvegarder
    const saveResult = await this.campaignRepository.save(updatedCampaign);

    if (!saveResult.success) {
      return fail(saveResult.error);
    }

    return ok({
      campaign: saveResult.value,
    });
  }
}
