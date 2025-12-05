/**
 * tRPC Client Configuration
 * Configuration du client tRPC pour React
 * IMPORTANT: Type-safety complète avec le serveur
 */

import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@/server/api/root';

/**
 * Client tRPC typé
 * Utilise les types du serveur pour une type-safety complète
 */
export const api = createTRPCReact<AppRouter>();
