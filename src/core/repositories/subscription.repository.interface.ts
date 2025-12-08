/**
 * Subscription Repository Interface
 * Contrat pour la persistence des abonnements
 * IMPORTANT: Interface uniquement, ZERO implémentation ici
 */

import { Result } from '@/lib/types/result.type';
import { SubscriptionId, UserId } from '@/lib/types/branded.type';
import { SubscriptionEntity } from '@/core/entities/subscription.entity';

export interface ISubscriptionRepository {
  /**
   * Trouve un abonnement par son ID
   */
  findById(id: SubscriptionId): Promise<SubscriptionEntity | null>;

  /**
   * Trouve l'abonnement d'un utilisateur
   */
  findByUser(userId: UserId): Promise<SubscriptionEntity | null>;

  /**
   * Trouve un abonnement par ID client Stripe
   */
  findByStripeCustomerId(stripeCustomerId: string): Promise<SubscriptionEntity | null>;

  /**
   * Trouve un abonnement par ID abonnement Stripe
   */
  findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<SubscriptionEntity | null>;

  /**
   * Sauvegarde ou met à jour un abonnement
   */
  save(subscription: SubscriptionEntity): Promise<Result<void>>;

  /**
   * Met à jour les IDs Stripe
   */
  updateStripeIds(
    id: SubscriptionId,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
  ): Promise<Result<void>>;

  /**
   * Met à jour la période de fin actuelle
   */
  updateCurrentPeriodEnd(id: SubscriptionId, currentPeriodEnd: Date): Promise<Result<void>>;

  /**
   * Marque un abonnement pour annulation en fin de période
   */
  scheduleCancellation(id: SubscriptionId): Promise<Result<void>>;

  /**
   * Annule l'annulation programmée
   */
  cancelScheduledCancellation(id: SubscriptionId): Promise<Result<void>>;

  /**
   * Trouve les abonnements expirés à traiter
   */
  findExpiredToProcess(): Promise<SubscriptionEntity[]>;

  /**
   * Trouve les abonnements à renouveler
   */
  findToRenew(beforeDate: Date): Promise<SubscriptionEntity[]>;

  /**
   * Compte les abonnements par plan
   */
  countByPlan(): Promise<{
    FREE: number;
    STARTER: number;
    PROFESSIONAL: number;
    ENTERPRISE: number;
  }>;

  /**
   * Compte les abonnements par statut
   */
  countByStatus(): Promise<{
    ACTIVE: number;
    TRIAL: number;
    CANCELLED: number;
    EXPIRED: number;
    SUSPENDED: number;
  }>;

  /**
   * Récupère les statistiques d'abonnement
   */
  getSubscriptionStats(): Promise<{
    totalActive: number;
    totalRevenue: number; // MRR
    averageRevenue: number;
    churnRate: number;
    growthRate: number;
  }>;

  /**
   * Vérifie les limites d'un utilisateur
   */
  checkUserLimits(userId: UserId): Promise<{
    storesUsed: number;
    storesLimit: number;
    campaignsUsed: number;
    campaignsLimit: number;
    canCreateStore: boolean;
    canCreateCampaign: boolean;
  }>;

  /**
   * Migre un utilisateur vers un nouveau plan
   */
  migratePlan(
    id: SubscriptionId,
    newPlan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
  ): Promise<Result<void>>;
}
