/**
 * Store Router
 * Routes tRPC pour la gestion des commerces
 * IMPORTANT: ZERO any types
 * Architecture Hexagonale: Router → Use Cases → Repositories
 */

import { createTRPCRouter } from '../trpc';
import { storeQueriesRouter } from './store/store-queries.router';
import { storeMutationsRouter } from './store/store-mutations.router';

export const storeRouter = createTRPCRouter({
  // Queries (lectures)
  getLimits: storeQueriesRouter.getLimits,
  list: storeQueriesRouter.list,
  getById: storeQueriesRouter.getById,

  // Mutations (écritures)
  create: storeMutationsRouter.create,
  update: storeMutationsRouter.update,
  delete: storeMutationsRouter.delete,
});
