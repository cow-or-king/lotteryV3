/**
 * Root API Router
 * Combine tous les routers tRPC de l'application
 * IMPORTANT: Type-safety complète entre client et serveur
 */

import { createTRPCRouter } from './trpc';
import { authRouter } from './routers/auth.router';

/**
 * Router principal de l'API
 * Tous les routers sont ajoutés ici
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  // TODO: Ajouter les autres routers
  // store: storeRouter,
  // campaign: campaignRouter,
  // lottery: lotteryRouter,
  // review: reviewRouter,
});

/**
 * Export du type pour le client
 * Permet l'inférence de types côté client
 */
export type AppRouter = typeof appRouter;
