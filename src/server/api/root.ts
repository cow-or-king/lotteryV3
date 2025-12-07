/**
 * Root API Router
 * Combine tous les routers tRPC de l'application
 * IMPORTANT: Type-safety complète entre client et serveur
 */

import { createTRPCRouter } from './trpc';
import { authRouter } from './routers/auth.router';
import { dashboardRouter } from './routers/dashboard.router';
import { storeRouter } from './routers/store.router';
import { brandRouter } from './routers/brand.router';

/**
 * Router principal de l'API
 * Tous les routers sont ajoutés ici
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  dashboard: dashboardRouter,
  store: storeRouter,
  brand: brandRouter,
  // TODO: Ajouter les autres routers
  // campaign: campaignRouter,
  // lottery: lotteryRouter,
  // review: reviewRouter,
});

/**
 * Export du type pour le client
 * Permet l'inférence de types côté client
 */
export type AppRouter = typeof appRouter;
