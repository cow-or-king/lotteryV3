/**
 * tRPC Configuration
 * Configuration de base pour tRPC avec type-safety complète
 * IMPORTANT: ZERO any types, tout est typé
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import { prisma } from '@/infrastructure/database/prisma-client';
import type { UserId } from '@/lib/types/branded.type';
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
  let user = await ctx.prisma.user.findUnique({
    where: { id: ctx.userId },
  });

  // Si l'utilisateur n'existe pas dans notre DB mais existe dans Supabase Auth,
  // on le crée/met à jour automatiquement (cas de migration ou premier login après register)
  if (!user && ctx.accessToken) {
    const { supabaseAuthService } = await import('@/infrastructure/auth/supabase-auth.service');
    const verifyResult = await supabaseAuthService.verifyToken(ctx.accessToken);

    if (verifyResult.success) {
      try {
        // Upsert l'utilisateur (créer ou mettre à jour) pour éviter les conflits d'email
        user = await ctx.prisma.user.upsert({
          where: { id: ctx.userId },
          update: {
            email: verifyResult.data.email || '',
            emailVerified: verifyResult.data.emailVerified,
          },
          create: {
            id: ctx.userId,
            email: verifyResult.data.email || '',
            emailVerified: verifyResult.data.emailVerified,
            name: null,
            avatarUrl: null,
          },
        });

        // Créer aussi la subscription FREE par défaut si elle n'existe pas
        await ctx.prisma.subscription.upsert({
          where: { userId: ctx.userId },
          update: {},
          create: {
            userId: ctx.userId,
            plan: 'FREE',
            status: 'ACTIVE',
            storesLimit: 1,
            campaignsLimit: 0,
          },
        });
      } catch (_error) {
        // Si erreur de contrainte d'unicité (race condition sur batch calls parallèles),
        // on réessaie de récupérer l'utilisateur qui a été créé par une requête parallèle
        user = await ctx.prisma.user.findUnique({
          where: { id: ctx.userId },
        });
      }
    }
  }

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
 * Middleware super-admin
 * Vérifie que l'utilisateur est un super-administrateur
 */
const enforceSuperAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // Récupérer l'utilisateur avec son role
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.userId },
    select: { id: true, email: true, role: true },
  });

  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Super admin access required',
    });
  }

  return next({
    ctx: {
      userId: ctx.userId,
      user,
    },
  });
});

/**
 * Procédure super-admin (authentifiée + role SUPER_ADMIN)
 * Nécessite les droits de super-administrateur
 */
export const superAdminProcedure = t.procedure.use(enforceSuperAdmin);

/**
 * Type du contexte pour réutilisation
 */
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
