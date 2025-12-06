/**
 * Session Management Service
 * Gestion des sessions avec cookies HTTP-only
 * IMPORTANT: ZERO any types
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Result } from '@/shared/types/result.type';
import type { UserId } from '@/shared/types/branded.type';
import type { AuthTokens } from './supabase-auth.service';
import { supabaseAuthService } from './supabase-auth.service';

/**
 * Configuration des cookies
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 jours
};

const ACCESS_TOKEN_COOKIE = 'rl-access-token';
const REFRESH_TOKEN_COOKIE = 'rl-refresh-token';
const USER_ID_COOKIE = 'rl-user-id';

/**
 * Type pour la session
 */
export interface Session {
  userId: UserId;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Service de gestion de session
 */
export class SessionService {
  /**
   * Créer une session
   */
  async createSession(tokens: AuthTokens, userId: UserId): Promise<Result<void>> {
    try {
      const cookieStore = await cookies();

      // Stocker les tokens dans des cookies HTTP-only
      cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: tokens.expiresIn,
      });

      cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 30, // 30 jours pour le refresh token
      });

      cookieStore.set(USER_ID_COOKIE, userId, {
        ...COOKIE_OPTIONS,
        httpOnly: false, // Accessible côté client pour l'UI
      });

      return { success: true, data: undefined };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Failed to create session'),
      };
    }
  }

  /**
   * Récupérer la session courante
   */
  async getSession(): Promise<Result<Session | null>> {
    try {
      const cookieStore = await cookies();

      const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
      const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
      const userId = cookieStore.get(USER_ID_COOKIE)?.value;

      if (!accessToken || !refreshToken || !userId) {
        return { success: true, data: null };
      }

      // Vérifier que le token est valide
      const verificationResult = await supabaseAuthService.verifyToken(accessToken);

      if (!verificationResult.success) {
        // Essayer de rafraîchir le token
        const refreshResult = await this.refreshSession(refreshToken);
        if (!refreshResult.success) {
          return { success: true, data: null };
        }
        return { success: true, data: refreshResult.data };
      }

      return {
        success: true,
        data: {
          userId: userId as UserId,
          accessToken,
          refreshToken,
          expiresAt: Date.now() + 3600 * 1000, // Approximation
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Failed to get session'),
      };
    }
  }

  /**
   * Rafraîchir la session
   */
  async refreshSession(refreshToken: string): Promise<Result<Session>> {
    try {
      const refreshResult = await supabaseAuthService.refreshTokens(refreshToken);

      if (!refreshResult.success) {
        return {
          success: false,
          error: refreshResult.error,
        };
      }

      const tokens = refreshResult.data;

      // Vérifier le nouveau token pour obtenir l'userId
      const verifyResult = await supabaseAuthService.verifyToken(tokens.accessToken);

      if (!verifyResult.success) {
        return {
          success: false,
          error: new Error('Failed to verify refreshed token'),
        };
      }

      const userId = verifyResult.data.id;

      // Mettre à jour les cookies
      await this.createSession(tokens, userId);

      return {
        success: true,
        data: {
          userId,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt * 1000, // Convertir en millisecondes
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Failed to refresh session'),
      };
    }
  }

  /**
   * Détruire la session
   */
  async destroySession(): Promise<Result<void>> {
    try {
      const cookieStore = await cookies();

      // Récupérer le token pour déconnecter côté Supabase
      const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

      if (accessToken) {
        await supabaseAuthService.signOut(accessToken);
      }

      // Supprimer les cookies
      cookieStore.delete(ACCESS_TOKEN_COOKIE);
      cookieStore.delete(REFRESH_TOKEN_COOKIE);
      cookieStore.delete(USER_ID_COOKIE);

      return { success: true, data: undefined };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Failed to destroy session'),
      };
    }
  }

  /**
   * Vérifier si une session existe (pour le middleware)
   */
  async hasValidSession(request: NextRequest): Promise<boolean> {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!accessToken || !refreshToken) {
      return false;
    }

    // Vérifier le token
    const verificationResult = await supabaseAuthService.verifyToken(accessToken);

    if (!verificationResult.success) {
      // Essayer de rafraîchir
      const refreshResult = await supabaseAuthService.refreshTokens(refreshToken);
      if (!refreshResult.success) {
        return false;
      }

      // Mettre à jour les cookies dans la réponse
      const response = NextResponse.next();
      response.cookies.set(ACCESS_TOKEN_COOKIE, refreshResult.data.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: refreshResult.data.expiresIn,
      });
      response.cookies.set(REFRESH_TOKEN_COOKIE, refreshResult.data.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return true;
  }

  /**
   * Obtenir l'userId depuis les cookies (côté client)
   */
  getUserIdFromCookies(): UserId | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const match = document.cookie.match(new RegExp(`${USER_ID_COOKIE}=([^;]+)`));
    return match ? (match[1] as UserId) : null;
  }
}

/**
 * Instance singleton du service
 */
export const sessionService = new SessionService();
