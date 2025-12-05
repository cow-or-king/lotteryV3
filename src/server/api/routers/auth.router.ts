/**
 * Auth Router
 * Endpoints tRPC pour l'authentification
 * IMPORTANT: Utilise les use cases du domain layer
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { RegisterUserUseCase } from '@/core/use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '@/core/use-cases/auth/login-user.use-case';
import { UserRepositoryPrisma } from '@/infrastructure/repositories/prisma/user.repository.prisma';
import { SubscriptionRepositoryPrisma } from '@/infrastructure/repositories/prisma/subscription.repository.prisma';
import bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';

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

// Password helpers
const passwordHasher = {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  },
};

const passwordVerifier = {
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
};

export const authRouter = createTRPCRouter({
  /**
   * Inscription d'un nouvel utilisateur
   */
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    // Instancier les repositories
    const userRepository = new UserRepositoryPrisma(ctx.prisma);
    const subscriptionRepository = new SubscriptionRepositoryPrisma(ctx.prisma);

    // Instancier le use case
    const registerUseCase = new RegisterUserUseCase(
      userRepository,
      subscriptionRepository,
      passwordHasher,
    );

    // Exécuter le use case
    const result = await registerUseCase.execute({
      email: input.email,
      password: input.password,
      name: input.name,
    });

    if (!result.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: result.error.message,
      });
    }

    return {
      success: true,
      data: result.data,
    };
  }),

  /**
   * Connexion d'un utilisateur
   */
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    // Instancier les repositories
    const userRepository = new UserRepositoryPrisma(ctx.prisma);
    const subscriptionRepository = new SubscriptionRepositoryPrisma(ctx.prisma);

    // Instancier le use case
    const loginUseCase = new LoginUserUseCase(
      userRepository,
      subscriptionRepository,
      passwordVerifier,
    );

    // Exécuter le use case
    const result = await loginUseCase.execute({
      email: input.email,
      password: input.password,
    });

    if (!result.success) {
      // Gérer les différents types d'erreurs
      const errorMessage = result.error.message;

      if (errorMessage.includes('Invalid')) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Email ou mot de passe incorrect',
        });
      }

      if (errorMessage.includes('suspended')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Compte suspendu',
        });
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur lors de la connexion',
      });
    }

    // TODO: Créer une session/JWT token ici
    // Pour l'instant on retourne juste les données

    return {
      success: true,
      data: result.data,
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
    // TODO: Invalider la session/JWT token

    return {
      success: true,
      message: 'Déconnexion réussie',
    };
  }),
});
