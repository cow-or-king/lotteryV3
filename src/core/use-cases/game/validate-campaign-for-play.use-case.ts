/**
 * Validate Campaign For Play Use Case
 * Vérifie qu'une campagne existe et est active pour le jeu
 * IMPORTANT: ZERO any types, Result Pattern
 * Architecture Hexagonale: Use Case ne dépend PAS de l'infrastructure
 */

import { Result } from '@/lib/types/result.type';
import type { CampaignForPlay } from '@/core/ports/campaign.repository';

// Re-export CampaignForPlay from repository for backwards compatibility
export type { CampaignForPlay };

export interface ValidateCampaignForPlayInput {
  campaignId: string;
}

export interface ValidateCampaignForPlayOutput {
  campaign: CampaignForPlay;
}

/**
 * Interface pour le repository Campaign (injection de dépendance)
 */
interface CampaignRepositoryForPlay {
  findByIdForPlay(id: string): Promise<CampaignForPlay | null>;
}

export class ValidateCampaignForPlayUseCase {
  constructor(private campaignRepo: CampaignRepositoryForPlay) {}

  async execute(
    input: ValidateCampaignForPlayInput,
  ): Promise<Result<ValidateCampaignForPlayOutput>> {
    // Charger la campagne avec ses relations via le repository
    const campaign = await this.campaignRepo.findByIdForPlay(input.campaignId);

    if (!campaign) {
      return Result.fail(new Error('Campagne introuvable'));
    }

    if (!campaign.isActive) {
      return Result.fail(new Error('Cette campagne n est pas active'));
    }

    return Result.ok({ campaign });
  }
}
