/**
 * Auth Session Router
 * Endpoints tRPC pour la gestion des sessions (login, logout, getMe, refreshSession)
 * IMPORTANT: Utilise les use cases du domain layer et Supabase Auth
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { RegisterUserUseCase } from '@/core/use-cases/auth/register-user.use-case';
import { UserRepositoryPrisma } from '@/infrastructure/repositories/prisma/user.repository.prisma';
import { SubscriptionRepositoryPrisma } from '@/infrastructure/repositories/prisma/subscription.repository.prisma';
import { supabaseAuthService } from '@/infrastructure/auth/supabase-auth.service';
import { sessionService } from '@/infrastructure/auth/session.service';
import { TRPCError } from '@trpc/server';

// Schemas de validation Zod
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const authSessionRouter = createTRPCRouter({
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
        async hash(_password: string): Promise<string> {
          return 'handled-by-supabase';
        },
      };

      const registerUseCase = new RegisterUserUseCase(
        userRepository,
        subscriptionRepository,
        passwordHasher,
      );

      await registerUseCase.execute({
        id: userId, // Use Supabase user ID
        email: input.email,
        password: 'handled-by-supabase',
        name: undefined,
        avatarUrl: undefined,
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

    // Récupérer la subscription
    const subscription = await ctx.prisma.subscription.findUnique({
      where: { userId: ctx.userId },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      role: user.role,
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            storesLimit: subscription.storesLimit,
            campaignsLimit: subscription.campaignsLimit,
          }
        : null,
    };
  }),

  /**
   * Déconnexion
   */
  logout: publicProcedure.mutation(async () => {
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
