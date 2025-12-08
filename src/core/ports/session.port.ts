/**
 * Session Manager Port (Interface)
 * Architecture hexagonale - Port pour la gestion des sessions
 * IMPORTANT: Interface du domain, implémentée dans l'infrastructure
 */

import type { NextRequest } from 'next/server';
import type { Result } from '@/lib/types/result.type';
import type { UserId } from '@/lib/types/branded.type';
import type { AuthTokens } from './auth.port';

/**
 * Session utilisateur
 */
export interface Session {
  readonly userId: UserId;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number;
}

/**
 * Port de gestion de session
 * Définit le contrat que tout gestionnaire de session doit respecter
 */
export interface ISessionManager {
  /**
   * Créer une nouvelle session
   */
  createSession(tokens: AuthTokens, userId: UserId): Promise<Result<void>>;

  /**
   * Récupérer la session courante
   */
  getSession(): Promise<Result<Session | null>>;

  /**
   * Rafraîchir une session
   */
  refreshSession(refreshToken: string): Promise<Result<Session>>;

  /**
   * Détruire la session
   */
  destroySession(): Promise<Result<void>>;

  /**
   * Vérifier si une session est valide (pour le middleware)
   */
  hasValidSession(request: NextRequest): Promise<boolean>;
}
