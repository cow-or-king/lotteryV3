/**
 * Review Router
 * Routes tRPC pour la gestion des avis Google
 * IMPORTANT: ZERO any types
 * Architecture Hexagonale: Router → Use Cases → Repositories
 */

import { createTRPCRouter } from '../trpc';
import { reviewQueriesRouter } from './review/review-queries.router';
import { reviewMutationsRouter } from './review/review-mutations.router';

export const reviewRouter = createTRPCRouter({
  // Queries (lectures)
  verifyParticipant: reviewQueriesRouter.verifyParticipant,
  getById: reviewQueriesRouter.getById,
  listByStore: reviewQueriesRouter.listByStore,
  getStats: reviewQueriesRouter.getStats,
  getAiServiceStatus: reviewQueriesRouter.getAiServiceStatus,

  // Mutations (écritures)
  respond: reviewMutationsRouter.respond,
  sync: reviewMutationsRouter.sync,
  generateAiResponse: reviewMutationsRouter.generateAiResponse,
});
