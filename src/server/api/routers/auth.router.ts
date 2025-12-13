/**
 * Auth Router
 * Endpoints tRPC pour l'authentification - Merge des routers session et account
 * IMPORTANT: Utilise les use cases du domain layer et Supabase Auth
 */

import { createTRPCRouter } from '../trpc';
import { authSessionRouter } from './auth-session.router';
import { authAccountRouter } from './auth-account.router';

export const authRouter = createTRPCRouter({
  // Session management (login, logout, getMe, refreshSession)
  ...authSessionRouter._def.procedures,

  // Account management (register, sendMagicLink, resetPassword, updatePassword)
  ...authAccountRouter._def.procedures,
});
