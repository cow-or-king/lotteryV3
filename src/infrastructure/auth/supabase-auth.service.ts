/**
 * Supabase Authentication Service
 * Service d'authentification utilisant Supabase
 * IMPORTANT: ZERO any types
 * Architecture hexagonale: Implémente IAuthProvider (port du domain)
 */

import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import type { Result } from '@/lib/types/result.type';
import { brandUserId } from '@/lib/types/branded.type';
import type { IAuthProvider, AuthUser, AuthTokens } from '@/core/ports/auth.port';

// Re-export types for backward compatibility
export type { AuthUser, AuthTokens };

/**
 * Configuration Supabase - Validate at module load
 */
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase configuration: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set',
  );
}

// Type-safe constants after validation
const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Service d'authentification Supabase
 * Implémente le port IAuthProvider
 */
export class SupabaseAuthService implements IAuthProvider {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient<never>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // On gère les sessions côté serveur
        autoRefreshToken: false,
      },
    });
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async signUp(email: string, password: string): Promise<Result<AuthUser>> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) {
        return {
          success: false,
          error: new Error(error.message),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: new Error('User creation failed'),
        };
      }

      const authUserResult = this.mapSupabaseUserToAuthUser(data.user);
      if (!authUserResult.success) {
        return authUserResult;
      }

      return {
        success: true,
        data: authUserResult.data,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Sign up failed'),
      };
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  async signIn(email: string, password: string): Promise<Result<AuthTokens>> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: new Error(error.message),
        };
      }

      if (!data.session) {
        return {
          success: false,
          error: new Error('No session created'),
        };
      }

      return {
        success: true,
        data: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: data.session.expires_in ?? 3600,
          expiresAt: data.session.expires_at ?? Date.now() / 1000 + 3600,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Sign in failed'),
      };
    }
  }

  /**
   * Envoi d'un magic link
   */
  async sendMagicLink(email: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) {
        return {
          success: false,
          error: new Error(error.message),
        };
      }

      return { success: true, data: undefined };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Failed to send magic link'),
      };
    }
  }

  /**
   * Réinitialisation du mot de passe
   */
  async resetPassword(email: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      });

      if (error) {
        return {
          success: false,
          error: new Error(error.message),
        };
      }

      return { success: true, data: undefined };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Failed to reset password'),
      };
    }
  }

  /**
   * Mise à jour du mot de passe
   */
  async updatePassword(accessToken: string, newPassword: string): Promise<Result<void>> {
    try {
      // Set the session first before updating the user
      await this.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '', // Not needed for update
      });

      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          success: false,
          error: new Error(error.message),
        };
      }

      return { success: true, data: undefined };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Failed to update password'),
      };
    }
  }

  /**
   * Déconnexion
   */
  async signOut(accessToken: string): Promise<Result<void>> {
    try {
      // Set the session before signing out
      await this.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '', // Not needed for signout
      });

      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: new Error(error.message),
        };
      }

      return { success: true, data: undefined };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Sign out failed'),
      };
    }
  }

  /**
   * Vérifier un token
   */
  async verifyToken(accessToken: string): Promise<Result<AuthUser>> {
    try {
      const { data, error } = await this.supabase.auth.getUser(accessToken);

      if (error) {
        return {
          success: false,
          error: new Error(error.message),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: new Error('No user found'),
        };
      }

      const authUserResult = this.mapSupabaseUserToAuthUser(data.user);
      if (!authUserResult.success) {
        return authUserResult;
      }

      return {
        success: true,
        data: authUserResult.data,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Token verification failed'),
      };
    }
  }

  /**
   * Rafraîchir les tokens
   */
  async refreshTokens(refreshToken: string): Promise<Result<AuthTokens>> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        return {
          success: false,
          error: new Error(error.message),
        };
      }

      if (!data.session) {
        return {
          success: false,
          error: new Error('No session created'),
        };
      }

      return {
        success: true,
        data: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: data.session.expires_in ?? 3600,
          expiresAt: data.session.expires_at ?? Date.now() / 1000 + 3600,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Token refresh failed'),
      };
    }
  }

  /**
   * Mapper un utilisateur Supabase vers notre AuthUser
   * Utilise brandUserId() pour validation sécurisée
   */
  private mapSupabaseUserToAuthUser(user: SupabaseUser): Result<AuthUser> {
    // Valider et brander l'userId
    const userIdResult = brandUserId(user.id);
    if (!userIdResult.success) {
      return {
        success: false,
        error: new Error(`Invalid user ID from Supabase: ${userIdResult.error.message}`),
      };
    }

    return {
      success: true,
      data: {
        id: userIdResult.data,
        email: user.email ?? '',
        emailVerified: !!user.email_confirmed_at,
        metadata: user.user_metadata,
      },
    };
  }
}

/**
 * Instance singleton du service
 */
export const supabaseAuthService = new SupabaseAuthService();
