/**
 * Campaign Repository Port
 * Interface pour abstraire l'accès aux campaigns
 * Architecture hexagonale: Port dans le core, Adapter dans l'infrastructure
 */

import type { Result } from '@/lib/types/result.type';
import type { CampaignEntity } from '@/core/entities/campaign.entity';
import type { Campaign, Game, Prize } from '@/generated/prisma';

export type { CampaignEntity };

/**
 * Campaign avec relations pour le gameplay
 */
export type CampaignForPlay = Campaign & {
  game: Game | null;
  prizes: Prize[];
  conditions: Array<{
    id: string;
    type: string;
    order: number;
    title: string;
    description: string | null;
    redirectUrl: string | null;
    iconEmoji: string | null;
    config: unknown;
    isRequired: boolean;
    enablesGame: boolean;
    createdAt: Date;
    updatedAt: Date;
    campaignId: string;
  }>;
};

export interface CampaignRepository {
  findById(id: string): Promise<Result<CampaignEntity | null>>;
  save(campaign: CampaignEntity): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
  activate(id: string): Promise<Result<void>>;
  deactivate(id: string): Promise<Result<void>>;

  /**
   * Trouve une campagne avec toutes les relations nécessaires pour le jeu
   * Inclut: game, prizes (avec remaining > 0), conditions
   */
  findByIdForPlay(id: string): Promise<Result<CampaignForPlay | null>>;
}
