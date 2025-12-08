/**
 * Participant Repository Interface
 * Contrat pour la persistence des participants
 * IMPORTANT: Interface uniquement, ZERO implémentation ici
 */

import { Result } from '@/lib/types/result.type';
import { ParticipantId, CampaignId } from '@/lib/types/branded.type';
import { Email } from '@/core/value-objects/email.vo';

export interface ParticipantData {
  readonly id: ParticipantId;
  readonly email: Email;
  readonly name: string | null;
  readonly phone: string | null;
  readonly campaignId: CampaignId;
  readonly hasPlayed: boolean;
  readonly playedAt: Date | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly hasReviewed: boolean;
  readonly reviewRating: number | null;
  readonly reviewComment: string | null;
  readonly createdAt: Date;
}

export interface CreateParticipantData {
  readonly email: Email;
  readonly name?: string;
  readonly phone?: string;
  readonly campaignId: CampaignId;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

export interface IParticipantRepository {
  /**
   * Trouve un participant par son ID
   */
  findById(id: ParticipantId): Promise<ParticipantData | null>;

  /**
   * Trouve un participant par email et campagne
   */
  findByEmailAndCampaign(email: Email, campaignId: CampaignId): Promise<ParticipantData | null>;

  /**
   * Trouve tous les participants d'une campagne
   */
  findByCampaign(
    campaignId: CampaignId,
    options?: {
      limit?: number;
      offset?: number;
      hasPlayed?: boolean;
      hasReviewed?: boolean;
    },
  ): Promise<ParticipantData[]>;

  /**
   * Crée un nouveau participant
   */
  create(data: CreateParticipantData): Promise<Result<ParticipantData>>;

  /**
   * Marque un participant comme ayant joué
   */
  markAsPlayed(id: ParticipantId, playedAt: Date): Promise<Result<void>>;

  /**
   * Enregistre l'avis d'un participant
   */
  saveReview(id: ParticipantId, rating: number, comment: string | null): Promise<Result<void>>;

  /**
   * Vérifie si un email a déjà participé
   */
  hasParticipated(email: Email, campaignId: CampaignId): Promise<boolean>;

  /**
   * Compte les participants d'une campagne
   */
  countByCampaign(campaignId: CampaignId): Promise<number>;

  /**
   * Compte les participants qui ont joué
   */
  countPlayedByCampaign(campaignId: CampaignId): Promise<number>;

  /**
   * Compte les participants qui ont laissé un avis
   */
  countReviewedByCampaign(campaignId: CampaignId): Promise<number>;

  /**
   * Récupère les statistiques des participants
   */
  getParticipantStats(campaignId: CampaignId): Promise<{
    total: number;
    played: number;
    reviewed: number;
    conversionRate: number;
    averageRating: number;
  }>;

  /**
   * Supprime les données personnelles d'un participant (RGPD)
   */
  anonymize(id: ParticipantId): Promise<Result<void>>;

  /**
   * Export des participants pour analyse
   */
  exportByCampaign(campaignId: CampaignId): Promise<ParticipantData[]>;
}
