/**
 * Auth Router
 * Endpoints tRPC pour l'authentification
 * IMPORTANT: Utilise les use cases du domain layer et Supabase Auth
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { RegisterUserUseCase } from '@/core/use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '@/core/use-cases/auth/login-user.use-case';
import { UserRepositoryPrisma } from '@/infrastructure/repositories/prisma/user.repository.prisma';
import { SubscriptionRepositoryPrisma } from '@/infrastructure/repositories/prisma/subscription.repository.prisma';
import { supabaseAuthService } from '@/infrastructure/auth/supabase-auth.service';
import { sessionService } from '@/infrastructure/auth/session.service';
import { TRPCError } from '@trpc/server';
import type { UserId } from '@/shared/types/branded.type';

// Schemas de validation Zod
const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const magicLinkSchema = z.object({
  email: z.string().email('Email invalide'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

const updatePasswordSchema = z.object({
  newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export const authRouter = createTRPCRouter({
  /**
   * Inscription d'un nouvel utilisateur
   */
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    // 1. Créer l'utilisateur dans Supabase Auth
    const authResult = await supabaseAuthService.signUp(input.email, input.password);

    if (!authResult.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: authResult.error.message,
      });
    }

    const supabaseUserId = authResult.data.id;

    // 2. Créer l'utilisateur dans notre base de données
    const userRepository = new UserRepositoryPrisma(ctx.prisma);
    const subscriptionRepository = new SubscriptionRepositoryPrisma(ctx.prisma);

    // Créer le use case avec un password hasher factice (on utilise Supabase pour l'auth)
    const passwordHasher = {
      async hash(password: string): Promise<string> {
        return 'handled-by-supabase'; // Le hash est géré par Supabase
      },
    };

    const registerUseCase = new RegisterUserUseCase(
      userRepository,
      subscriptionRepository,
      passwordHasher,
    );

    const result = await registerUseCase.execute({
      email: input.email,
      password: 'handled-by-supabase', // On ne stocke pas le mot de passe
      name: input.name,
    });

    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user profile',
      });
    }

    return {
      success: true,
      data: {
        id: supabaseUserId,
        email: input.email,
        name: input.name,
        message: 'Registration successful. Please check your email to verify your account.',
      },
    };
  }),

  /**
   * Connexion d'un utilisateur
   */
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    // 1. Authentifier avec Supabase
    const authResult = await supabaseAuthService.signIn(input.email, input.password);

    if (!authResult.success) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Email ou mot de passe incorrect',
      });
    }

    const tokens = authResult.data;

    // 2. Vérifier le token pour obtenir l'userId
    const verifyResult = await supabaseAuthService.verifyToken(tokens.accessToken);

    if (!verifyResult.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to verify authentication',
      });
    }

    const userId = verifyResult.data.id;

    // 3. Récupérer les données de l'utilisateur depuis notre DB
    const userRepository = new UserRepositoryPrisma(ctx.prisma);
    const user = await userRepository.findById(userId);

    if (!user) {
      // L'utilisateur existe dans Supabase mais pas dans notre DB, on le crée
      const subscriptionRepository = new SubscriptionRepositoryPrisma(ctx.prisma);
      const passwordHasher = {
        async hash(password: string): Promise<string> {
          return 'handled-by-supabase';
        },
      };

      const registerUseCase = new RegisterUserUseCase(
        userRepository,
        subscriptionRepository,
        passwordHasher,
      );

      await registerUseCase.execute({
        email: input.email,
        password: 'handled-by-supabase',
        name: undefined,
      });
    }

    // 4. Créer la session avec cookies HTTP-only
    const sessionResult = await sessionService.createSession(tokens, userId);

    if (!sessionResult.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create session',
      });
    }

    return {
      success: true,
      data: {
        id: userId,
        email: input.email,
        emailVerified: verifyResult.data.emailVerified,
      },
    };
  }),

  /**
   * Récupère l'utilisateur courant
   */
  getMe: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return null;
    }

    const userRepository = new UserRepositoryPrisma(ctx.prisma);
    const user = await userRepository.findById(ctx.userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
    };
  }),

  /**
   * Déconnexion
   */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    const result = await sessionService.destroySession();

    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to logout',
      });
    }

    return {
      success: true,
      message: 'Déconnexion réussie',
    };
  }),

  /**
   * Envoyer un magic link
   */
  sendMagicLink: publicProcedure.input(magicLinkSchema).mutation(async ({ input }) => {
    const result = await supabaseAuthService.sendMagicLink(input.email);

    if (!result.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: result.error.message,
      });
    }

    return {
      success: true,
      message: 'Magic link envoyé. Vérifiez votre boîte mail.',
    };
  }),

  /**
   * Réinitialiser le mot de passe
   */
  resetPassword: publicProcedure.input(resetPasswordSchema).mutation(async ({ input }) => {
    const result = await supabaseAuthService.resetPassword(input.email);

    if (!result.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: result.error.message,
      });
    }

    return {
      success: true,
      message: 'Email de réinitialisation envoyé.',
    };
  }),

  /**
   * Mettre à jour le mot de passe (utilisateur connecté)
   */
  updatePassword: protectedProcedure
    .input(updatePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.accessToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        });
      }

      const result = await supabaseAuthService.updatePassword(ctx.accessToken, input.newPassword);

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error.message,
        });
      }

      return {
        success: true,
        message: 'Mot de passe mis à jour avec succès.',
      };
    }),

  /**
   * Rafraîchir la session
   */
  refreshSession: publicProcedure.mutation(async ({ ctx }) => {
    if (!ctx.refreshToken) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'No refresh token',
      });
    }

    const result = await sessionService.refreshSession(ctx.refreshToken);

    if (!result.success) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Failed to refresh session',
      });
    }

    return {
      success: true,
      data: {
        userId: result.data.userId,
        expiresAt: result.data.expiresAt,
      },
    };
  }),
});
