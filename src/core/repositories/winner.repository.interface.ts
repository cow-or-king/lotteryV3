/**
 * Winner Repository Interface
 * Contrat pour la persistence des gagnants
 * IMPORTANT: Interface uniquement, ZERO implémentation ici
 */

import { Result } from '@/lib/types/result.type';
import { WinnerId, PrizeId, CampaignId } from '@/lib/types/branded.type';
import { Email } from '@/core/value-objects/email.vo';
import { ClaimCode } from '@/core/value-objects/claim-code.vo';

export type WinnerStatus = 'PENDING' | 'CLAIMED' | 'EXPIRED' | 'CANCELLED';

export interface WinnerData {
  readonly id: WinnerId;
  readonly prizeId: PrizeId;
  readonly participantEmail: Email;
  readonly participantName: string | null;
  readonly claimCode: ClaimCode;
  readonly status: WinnerStatus;
  readonly claimedAt: Date | null;
  readonly expiresAt: Date;
  readonly createdAt: Date;
}

export interface CreateWinnerData {
  readonly prizeId: PrizeId;
  readonly participantEmail: Email;
  readonly participantName?: string;
  readonly expiresAt: Date;
}

export interface IWinnerRepository {
  /**
   * Trouve un gagnant par son ID
   */
  findById(id: WinnerId): Promise<WinnerData | null>;

  /**
   * Trouve un gagnant par code de réclamation
   */
  findByClaimCode(claimCode: ClaimCode): Promise<WinnerData | null>;

  /**
   * Trouve tous les gagnants d'un prix
   */
  findByPrize(prizeId: PrizeId): Promise<WinnerData[]>;

  /**
   * Trouve tous les gagnants d'une campagne
   */
  findByCampaign(campaignId: CampaignId): Promise<WinnerData[]>;

  /**
   * Trouve les gagnants par email
   */
  findByEmail(email: Email): Promise<WinnerData[]>;

  /**
   * Crée un nouveau gagnant
   */
  create(data: CreateWinnerData): Promise<Result<WinnerData>>;

  /**
   * Marque un prix comme réclamé
   */
  claim(id: WinnerId, claimedAt: Date): Promise<Result<void>>;

  /**
   * Marque un prix comme expiré
   */
  expire(id: WinnerId): Promise<Result<void>>;

  /**
   * Annule un gain (restaure le stock du prix)
   */
  cancel(id: WinnerId): Promise<Result<void>>;

  /**
   * Trouve les gains expirés à traiter
   */
  findExpiredToProcess(): Promise<WinnerData[]>;

  /**
   * Compte les gagnants par statut
   */
  countByStatus(prizeId: PrizeId): Promise<{
    pending: number;
    claimed: number;
    expired: number;
    cancelled: number;
  }>;

  /**
   * Vérifie si un email a déjà gagné dans une campagne
   */
  hasWonInCampaign(email: Email, campaignId: CampaignId): Promise<boolean>;

  /**
   * Récupère les statistiques des gagnants
   */
  getWinnerStats(campaignId: CampaignId): Promise<{
    total: number;
    claimed: number;
    pending: number;
    expired: number;
    claimRate: number;
    averageClaimTime: number; // en heures
  }>;

  /**
   * Prolonge la date d'expiration d'un gain
   */
  extendExpiration(id: WinnerId, newExpiresAt: Date): Promise<Result<void>>;

  /**
   * Génère un rapport des gains pour export
   */
  generateWinnersReport(campaignId: CampaignId): Promise<
    Array<{
      prizeName: string;
      winnerEmail: string;
      winnerName: string | null;
      claimCode: string;
      status: WinnerStatus;
      wonAt: Date;
      claimedAt: Date | null;
    }>
  >;
}
