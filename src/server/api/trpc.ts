/**
 * tRPC Configuration
 * Configuration de base pour tRPC avec type-safety complète
 * IMPORTANT: ZERO any types, tout est typé
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { prisma } from '@/infrastructure/database/prisma-client';
import type { UserId } from '@/shared/types/branded.type';

/**
 * Context de base pour chaque requête
 * Contient les informations partagées entre tous les endpoints
 */
interface CreateContextOptions {
  userId: UserId | null;
  sessionId: string | null;
}

/**
 * Crée le contexte utilisé dans les procédures tRPC
 * Ce contexte est disponible dans toutes les procédures
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    prisma,
    userId: opts.userId,
    sessionId: opts.sessionId,
  };
};

/**
 * Context pour les requêtes HTTP
 * Extrait les informations de session depuis les headers/cookies
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // TODO: Extraire l'userId depuis le token JWT/session
  // Pour l'instant, on retourne null
  const userId = null as UserId | null;
  const sessionId = req.cookies['session-id'] ?? null;

  return createInnerTRPCContext({
    userId,
    sessionId,
  });
};

/**
 * Initialisation de tRPC avec le contexte
 * Utilise SuperJSON pour la sérialisation des dates et types complexes
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
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
 * Vérifie que l'utilisateur est connecté
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      // userId est maintenant garanti non-null
      userId: ctx.userId,
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
