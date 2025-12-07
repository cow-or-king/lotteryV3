/**
 * ListCampaigns Use Case
 * Cas d'usage: Lister les campagnes d'un magasin
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { CampaignRepository } from '@/core/ports/campaign.repository';
import type { CampaignEntity } from '@/core/entities/campaign.entity';

export interface ListCampaignsInput {
  storeId?: string;
  isActive?: boolean;
}

export interface ListCampaignsOutput {
  campaigns: CampaignEntity[];
  total: number;
}

export class ListCampaignsUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(input: ListCampaignsInput): Promise<Result<ListCampaignsOutput>> {
    // Si storeId est fourni, récupérer les campagnes du magasin
    if (input.storeId) {
      const campaignsResult = await this.campaignRepository.findByStoreId(input.storeId);

      if (!campaignsResult.success) {
        return fail(campaignsResult.error);
      }

      let campaigns = campaignsResult.value;

      // Filtrer par statut si demandé
      if (input.isActive !== undefined) {
        campaigns = campaigns.filter((c) => c.isActive === input.isActive);
      }

      return ok({
        campaigns,
        total: campaigns.length,
      });
    }

    // Sinon, récupérer toutes les campagnes (avec filtrage optionnel par statut)
    const allCampaignsResult = await this.campaignRepository.findAll();

    if (!allCampaignsResult.success) {
      return fail(allCampaignsResult.error);
    }

    let campaigns = allCampaignsResult.value;

    // Filtrer par statut si demandé
    if (input.isActive !== undefined) {
      campaigns = campaigns.filter((c) => c.isActive === input.isActive);
    }

    return ok({
      campaigns,
      total: campaigns.length,
    });
  }
}
