/**
 * Auth Provider Port (Interface)
 * Architecture hexagonale - Port pour l'authentification
 * IMPORTANT: Interface du domain, implémentée dans l'infrastructure
 */

import type { Result } from '@/shared/types/result.type';
import type { UserId } from '@/shared/types/branded.type';

/**
 * Données utilisateur authentifié
 */
export interface AuthUser {
  readonly id: UserId;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Tokens d'authentification
 */
export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly expiresAt: number;
}

/**
 * Port d'authentification
 * Définit le contrat que tout provider d'authentification doit respecter
 */
export interface IAuthProvider {
  /**
   * Inscription d'un nouvel utilisateur
   */
  signUp(email: string, password: string): Promise<Result<AuthUser>>;

  /**
   * Connexion d'un utilisateur
   */
  signIn(email: string, password: string): Promise<Result<AuthTokens>>;

  /**
   * Envoyer un lien magique par email
   */
  sendMagicLink(email: string): Promise<Result<void>>;

  /**
   * Réinitialiser le mot de passe
   */
  resetPassword(email: string): Promise<Result<void>>;

  /**
   * Mettre à jour le mot de passe
   */
  updatePassword(accessToken: string, newPassword: string): Promise<Result<void>>;

  /**
   * Déconnexion
   */
  signOut(accessToken: string): Promise<Result<void>>;

  /**
   * Vérifier un token d'accès
   */
  verifyToken(accessToken: string): Promise<Result<AuthUser>>;

  /**
   * Rafraîchir les tokens
   */
  refreshTokens(refreshToken: string): Promise<Result<AuthTokens>>;
}
