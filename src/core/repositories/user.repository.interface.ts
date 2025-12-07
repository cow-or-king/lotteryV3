/**
 * User Repository Interface
 * Contrat pour la persistence des utilisateurs
 * IMPORTANT: Interface uniquement, ZERO implémentation ici
 */

import { Result } from '@/shared/types/result.type';
import { UserId } from '@/shared/types/branded.type';
import { Email } from '@/core/value-objects/email.vo';
import { UserEntity } from '@/core/entities/user.entity';

export interface IUserRepository {
  /**
   * Trouve un utilisateur par son ID
   */
  findById(id: UserId): Promise<UserEntity | null>;

  /**
   * Trouve un utilisateur par son email
   */
  findByEmail(email: Email): Promise<UserEntity | null>;

  /**
   * Vérifie si un email existe déjà
   */
  emailExists(email: Email): Promise<boolean>;

  /**
   * Sauvegarde ou met à jour un utilisateur
   */
  save(user: UserEntity): Promise<Result<void>>;

  /**
   * Supprime un utilisateur
   */
  delete(id: UserId): Promise<Result<void>>;

  /**
   * Compte le nombre de stores d'un utilisateur
   */
  countUserStores(userId: UserId): Promise<number>;

  /**
   * Récupère tous les utilisateurs (avec pagination)
   */
  findAll(options?: {
    limit?: number;
    offset?: number;
    orderBy?: 'createdAt' | 'email';
    order?: 'asc' | 'desc';
  }): Promise<UserEntity[]>;
}
