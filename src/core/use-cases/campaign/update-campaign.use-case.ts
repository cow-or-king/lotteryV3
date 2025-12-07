/**
 * UpdateCampaign Use Case
 * Cas d'usage: Mettre à jour une campagne existante
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { CampaignRepository } from '@/core/ports/campaign.repository';
import type { CampaignEntity } from '@/core/entities/campaign.entity';

export interface UpdateCampaignInput {
  id: string;
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
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(input: UpdateCampaignInput): Promise<Result<UpdateCampaignOutput>> {
    // Validation de l'ID
    if (!input.id || input.id.trim().length === 0) {
      return fail('Campaign ID is required');
    }

    // Récupérer la campagne existante
    const existingCampaignResult = await this.campaignRepository.findById(input.id);

    if (!existingCampaignResult.success) {
      return fail(existingCampaignResult.error);
    }

    const existingCampaign = existingCampaignResult.value;

    if (!existingCampaign) {
      return fail('Campaign not found');
    }

    // Validation du nom si fourni
    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        return fail('Campaign name cannot be empty');
      }

      if (input.name.trim().length < 2) {
        return fail('Campaign name must be at least 2 characters long');
      }

      if (input.name.trim().length > 200) {
        return fail('Campaign name must be at most 200 characters long');
      }
    }

    // Validation des dates si fournies
    if (input.startDate && input.endDate) {
      if (input.startDate >= input.endDate) {
        return fail('Start date must be before end date');
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
