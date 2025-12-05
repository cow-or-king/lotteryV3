/**
 * Prize Repository Interface
 * Contrat pour la persistence des prix
 * IMPORTANT: Interface uniquement, ZERO implémentation ici
 */

import { Result } from '@/shared/types/result.type';
import { PrizeId, CampaignId } from '@/shared/types/branded.type';
import { PrizeEntity } from '@/core/entities/prize.entity';

export interface IPrizeRepository {
  /**
   * Trouve un prix par son ID
   */
  findById(id: PrizeId): Promise<PrizeEntity | null>;

  /**
   * Trouve tous les prix d'une campagne
   */
  findByCampaign(campaignId: CampaignId): Promise<PrizeEntity[]>;

  /**
   * Trouve les prix disponibles d'une campagne
   */
  findAvailableByCampaign(campaignId: CampaignId): Promise<PrizeEntity[]>;

  /**
   * Sauvegarde ou met à jour un prix
   */
  save(prize: PrizeEntity): Promise<Result<void>>;

  /**
   * Sauvegarde plusieurs prix en batch
   */
  saveMany(prizes: PrizeEntity[]): Promise<Result<void>>;

  /**
   * Supprime un prix
   */
  delete(id: PrizeId): Promise<Result<void>>;

  /**
   * Décrémente le stock d'un prix (atomique)
   */
  decrementStock(id: PrizeId): Promise<Result<void>>;

  /**
   * Incrémente le stock d'un prix (atomique, pour annulation)
   */
  incrementStock(id: PrizeId): Promise<Result<void>>;

  /**
   * Vérifie que la somme des probabilités d'une campagne est valide
   */
  validateCampaignProbabilities(campaignId: CampaignId): Promise<Result<void>>;

  /**
   * Calcule la probabilité totale des prix d'une campagne
   */
  getTotalProbability(campaignId: CampaignId): Promise<number>;

  /**
   * Compte le nombre de gagnants d'un prix
   */
  countWinners(prizeId: PrizeId): Promise<number>;

  /**
   * Récupère les statistiques d'un prix
   */
  getPrizeStats(prizeId: PrizeId): Promise<{
    totalQuantity: number;
    remaining: number;
    winnersCount: number;
    claimRate: number; // % de prix réclamés
    averageClaimTime: number; // en heures
  }>;

  /**
   * Trouve le prix à attribuer selon les probabilités
   * (utilise un algorithme de sélection pondérée)
   */
  selectPrizeByProbability(campaignId: CampaignId): Promise<PrizeEntity | null>;

  /**
   * Met à jour les statistiques de gagnants en batch
   */
  updateWinnersCount(
    updates: Array<{ prizeId: PrizeId; increment: number }>,
  ): Promise<Result<void>>;
}
