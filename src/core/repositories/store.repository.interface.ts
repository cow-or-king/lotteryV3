/**
 * Store Repository Interface
 * Contrat pour la persistence des stores
 * IMPORTANT: Interface uniquement, ZERO implémentation ici
 */

import { Result } from '@/shared/types/result.type';
import { StoreId, UserId } from '@/shared/types/branded.type';
import { StoreEntity } from '@/core/entities/store.entity';

export interface IStoreRepository {
  /**
   * Trouve un store par son ID
   */
  findById(id: StoreId): Promise<StoreEntity | null>;

  /**
   * Trouve un store par son slug
   */
  findBySlug(slug: string): Promise<StoreEntity | null>;

  /**
   * Vérifie si un slug existe déjà
   */
  slugExists(slug: string): Promise<boolean>;

  /**
   * Trouve tous les stores d'un utilisateur
   */
  findByOwner(ownerId: UserId): Promise<StoreEntity[]>;

  /**
   * Trouve tous les stores actifs
   */
  findActiveStores(options?: { limit?: number; offset?: number }): Promise<StoreEntity[]>;

  /**
   * Sauvegarde ou met à jour un store
   */
  save(store: StoreEntity): Promise<Result<void>>;

  /**
   * Supprime un store
   */
  delete(id: StoreId): Promise<Result<void>>;

  /**
   * Compte le nombre de campagnes d'un store
   */
  countStoreCampaigns(storeId: StoreId): Promise<number>;

  /**
   * Vérifie si un utilisateur est propriétaire d'un store
   */
  isOwner(storeId: StoreId, userId: UserId): Promise<boolean>;

  /**
   * Met à jour le statut de paiement d'un store
   */
  updatePaymentStatus(storeId: StoreId, isPaid: boolean): Promise<Result<void>>;

  /**
   * Récupère des statistiques d'un store
   */
  getStoreStats(storeId: StoreId): Promise<{
    totalCampaigns: number;
    activeCampaigns: number;
    totalParticipants: number;
    totalWinners: number;
  }>;
}
