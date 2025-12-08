/**
 * Campaign Repository Interface
 * Contrat pour la persistence des campagnes
 * IMPORTANT: Interface uniquement, ZERO implémentation ici
 */

import { Result } from '@/lib/types/result.type';
import { CampaignId, StoreId } from '@/lib/types/branded.type';
import { CampaignEntity } from '@/core/entities/campaign.entity';

export interface ICampaignRepository {
  /**
   * Trouve une campagne par son ID
   */
  findById(id: CampaignId): Promise<CampaignEntity | null>;

  /**
   * Trouve toutes les campagnes d'un store
   */
  findByStore(storeId: StoreId): Promise<CampaignEntity[]>;

  /**
   * Trouve les campagnes actives d'un store
   */
  findActiveByStore(storeId: StoreId): Promise<CampaignEntity[]>;

  /**
   * Trouve toutes les campagnes en cours (running)
   */
  findRunningCampaigns(): Promise<CampaignEntity[]>;

  /**
   * Trouve les campagnes qui doivent être activées
   */
  findCampaignsToActivate(): Promise<CampaignEntity[]>;

  /**
   * Trouve les campagnes qui doivent être désactivées
   */
  findCampaignsToDeactivate(): Promise<CampaignEntity[]>;

  /**
   * Sauvegarde ou met à jour une campagne
   */
  save(campaign: CampaignEntity): Promise<Result<void>>;

  /**
   * Supprime une campagne
   */
  delete(id: CampaignId): Promise<Result<void>>;

  /**
   * Active une campagne
   */
  activate(id: CampaignId): Promise<Result<void>>;

  /**
   * Désactive une campagne
   */
  deactivate(id: CampaignId): Promise<Result<void>>;

  /**
   * Compte le nombre de participants d'une campagne
   */
  countParticipants(campaignId: CampaignId): Promise<number>;

  /**
   * Compte le nombre de gagnants d'une campagne
   */
  countWinners(campaignId: CampaignId): Promise<number>;

  /**
   * Vérifie si un email a déjà participé à une campagne
   */
  hasParticipated(campaignId: CampaignId, email: string): Promise<boolean>;

  /**
   * Récupère des statistiques d'une campagne
   */
  getCampaignStats(campaignId: CampaignId): Promise<{
    totalParticipants: number;
    uniqueParticipants: number;
    totalWinners: number;
    prizesAwarded: number;
    conversionRate: number; // % de participants qui ont laissé un avis
  }>;

  /**
   * Récupère les campagnes avec pagination et filtres
   */
  findAll(options?: {
    limit?: number;
    offset?: number;
    storeId?: StoreId;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
    orderBy?: 'createdAt' | 'startDate' | 'endDate' | 'name';
    order?: 'asc' | 'desc';
  }): Promise<CampaignEntity[]>;
}
