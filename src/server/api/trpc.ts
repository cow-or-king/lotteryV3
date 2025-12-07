/**
 * tRPC Configuration
 * Configuration de base pour tRPC avec type-safety complète
 * IMPORTANT: ZERO any types, tout est typé
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import { prisma } from '@/infrastructure/database/prisma-client';
import type { UserId } from '@/shared/types/branded.type';
import { sessionService } from '@/infrastructure/auth/session.service';

/**
 * Context de base pour chaque requête
 * Contient les informations partagées entre tous les endpoints
 */
interface CreateContextOptions {
  userId: UserId | null;
  accessToken: string | null;
  refreshToken: string | null;
  prisma?: typeof prisma; // Optional prisma for testing
}

/**
 * Crée le contexte utilisé dans les procédures tRPC
 * Ce contexte est disponible dans toutes les procédures
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    prisma: opts.prisma ?? prisma, // Use provided prisma or default
    userId: opts.userId,
    accessToken: opts.accessToken,
    refreshToken: opts.refreshToken,
  };
};

/**
 * Context pour les requêtes HTTP
 * Extrait les informations de session depuis les headers/cookies
 * Compatible avec fetchRequestHandler
 */
export const createTRPCContext = async () => {
  // Récupérer la session depuis les cookies
  const sessionResult = await sessionService.getSession();

  let userId: UserId | null = null;
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  if (sessionResult.success && sessionResult.data) {
    userId = sessionResult.data.userId;
    accessToken = sessionResult.data.accessToken;
    refreshToken = sessionResult.data.refreshToken;
  }

  return createInnerTRPCContext({
    userId,
    accessToken,
    refreshToken,
  });
};

/**
 * Initialisation de tRPC avec le contexte
 * Note: Pas de transformer pour éviter les problèmes avec fetchRequestHandler
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export des helpers tRPC réutilisables
 */
export const createTRPCRouter = t.router;

/**
 * Procédure publique (non authentifiée)
 * Accessible par tous les utilisateurs
 */
export const publicProcedure = t.procedure;

/**
 * Middleware d'authentification
 * Vérifie que l'utilisateur est connecté et récupère ses infos
 */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // Récupérer l'utilisateur depuis la DB
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.userId },
  });

  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
  }

  return next({
    ctx: {
      // userId et user sont maintenant garantis non-null
      userId: ctx.userId,
      user,
    },
  });
});

/**
 * Procédure protégée (authentifiée)
 * Nécessite une authentification valide
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

/**
 * Type du contexte pour réutilisation
 */
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
