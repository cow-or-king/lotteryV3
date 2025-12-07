/**
 * E2E Test Users Fixtures
 * Utilisateurs de test pour les E2E
 * IMPORTANT: ZERO any types
 */

import type { TestUser } from '../utils/auth';

/**
 * Utilisateur de test pour les E2E
 * IMPORTANT: Ces credentials doivent exister dans la DB de test
 */
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'Test123456!',
  } as TestUser,

  user: {
    email: 'user@test.com',
    password: 'Test123456!',
  } as TestUser,
} as const;
