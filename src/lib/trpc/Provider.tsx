/**
 * tRPC Provider Component
 * Provider pour tRPC et React Query
 * IMPORTANT: Doit wrapper toute l'application
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { useState } from 'react';
import { api } from './client';

/**
 * Fonction pour obtenir l'URL de base
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Côté client, on utilise l'URL relative
    return '';
  }
  // Côté serveur, on utilise l'URL complète
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Provider tRPC pour l'application
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute - les données restent fraîches plus longtemps
            gcTime: 5 * 60 * 1000, // 5 minutes - garde les données en cache
            refetchOnWindowFocus: false, // Pas de refetch automatique au focus
            refetchOnReconnect: false, // Pas de refetch à la reconnexion
            retry: 1, // Réduit les tentatives de retry
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            return {
              // Ajouter les headers personnalisés si nécessaire
            };
          },
        }),
      ],
    }),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
