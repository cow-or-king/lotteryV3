/**
 * Auth Account Router
 * Endpoints tRPC pour la gestion des comptes (register, resetPassword, etc.)
 * IMPORTANT: Utilise les use cases du domain layer et Supabase Auth
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { RegisterUserUseCase } from '@/core/use-cases/auth/register-user.use-case';
import { UserRepositoryPrisma } from '@/infrastructure/repositories/prisma/user.repository.prisma';
import { SubscriptionRepositoryPrisma } from '@/infrastructure/repositories/prisma/subscription.repository.prisma';
import { supabaseAuthService } from '@/infrastructure/auth/supabase-auth.service';
import { sessionService } from '@/infrastructure/auth/session.service';
import { TRPCError } from '@trpc/server';

// Schemas de validation Zod
const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
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

export const authAccountRouter = createTRPCRouter({
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

    // Auto-confirmer l'email (dev + production temporairement)
    // TODO: Retirer en production une fois qu'on a un système d'emails
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase configuration for auto-confirm');
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      await supabaseAdmin.auth.admin.updateUserById(supabaseUserId, {
        email_confirm: true,
      });
    } catch (_err) {
      // On continue quand même, l'utilisateur pourra confirmer manuellement
    }

    // 2. Créer l'utilisateur dans notre base de données
    const userRepository = new UserRepositoryPrisma(ctx.prisma);
    const subscriptionRepository = new SubscriptionRepositoryPrisma(ctx.prisma);

    // Créer le use case avec un password hasher factice (on utilise Supabase pour l'auth)
    const passwordHasher = {
      async hash(_password: string): Promise<string> {
        return 'handled-by-supabase'; // Le hash est géré par Supabase
      },
    };

    const registerUseCase = new RegisterUserUseCase(
      userRepository,
      subscriptionRepository,
      passwordHasher,
    );

    const result = await registerUseCase.execute({
      id: supabaseUserId, // Use Supabase user ID
      email: input.email,
      password: 'handled-by-supabase', // On ne stocke pas le mot de passe
      name: input.name,
      avatarUrl: undefined,
    });

    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user profile',
      });
    }

    // Mettre à jour emailVerified dans notre DB (toujours auto-confirmé pour le moment)
    await ctx.prisma.user.update({
      where: { id: supabaseUserId },
      data: { emailVerified: true },
    });

    // 3. Connecter automatiquement l'utilisateur après registration
    const loginResult = await supabaseAuthService.signIn(input.email, input.password);

    if (!loginResult.success) {
      // Si la connexion échoue (ex: email non vérifié), on retourne quand même le succès
      // L'utilisateur pourra se connecter plus tard
      return {
        success: true,
        data: {
          id: supabaseUserId,
          email: input.email,
          name: input.name,
          message:
            'Registration successful. Please check your email to verify your account before logging in.',
        },
      };
    }

    const tokens = loginResult.data;

    // 4. Créer la session avec cookies HTTP-only
    const sessionResult = await sessionService.createSession(tokens, supabaseUserId);

    if (!sessionResult.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create session',
      });
    }

    return {
      success: true,
      data: {
        id: supabaseUserId,
        email: input.email,
        name: input.name,
        message: 'Registration successful! You are now logged in.',
      },
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
});
