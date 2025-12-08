/**
 * Campaign Repository Port
 * Interface pour abstraire l'accès aux campaigns
 * Architecture hexagonale: Port dans le core, Adapter dans l'infrastructure
 */

import type { Result } from '@/lib/types/result.type';
import type { CampaignEntity } from '@/core/entities/campaign.entity';

export type { CampaignEntity };

export interface CampaignRepository {
  findById(id: string): Promise<Result<CampaignEntity | null>>;
  save(campaign: CampaignEntity): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
  activate(id: string): Promise<Result<void>>;
  deactivate(id: string): Promise<Result<void>>;
}
