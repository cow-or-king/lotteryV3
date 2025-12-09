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
import { prizeTemplateRouter } from './routers/prize-template.router';
import { prizeSetRouter } from './routers/prize-set.router';
import { reviewRouter } from './routers/review.router';
import { responseTemplateRouter } from './routers/response-template.router';
import { adminRouter } from './routers/admin.router';

/**
 * Router principal de l'API
 * Tous les routers sont ajoutés ici
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  dashboard: dashboardRouter,
  store: storeRouter,
  brand: brandRouter,
  prizeTemplate: prizeTemplateRouter,
  prizeSet: prizeSetRouter,
  review: reviewRouter,
  responseTemplate: responseTemplateRouter,
  admin: adminRouter,
  // TODO: Ajouter les autres routers
  // campaign: campaignRouter,
  // lottery: lotteryRouter,
});

/**
 * Export du type pour le client
 * Permet l'inférence de types côté client
 */
export type AppRouter = typeof appRouter;
