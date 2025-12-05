/**
 * tRPC HTTP Handler
 * Endpoint API pour tRPC dans Next.js App Router
 * Route: /api/trpc/[trpc]
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';
import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';

/**
 * Configuration de l'edge runtime pour de meilleures performances
 * Commenté pour l'instant, peut être activé si nécessaire
 */
// export const runtime = 'edge';

/**
 * Handler pour toutes les requêtes tRPC
 * Supporte GET et POST
 */
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req, res: undefined as any }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
          }
        : undefined,
  });

export { handler as GET, handler as POST };
