/**
 * E2E Auth Utilities
 * Utilitaires pour l'authentification dans les tests E2E
 * IMPORTANT: ZERO any types
 */

import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
}

/**
 * Login helper pour les tests E2E
 */
export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');

  // Attendre la redirection vers le dashboard
  await page.waitForURL('/dashboard');
}

/**
 * Logout helper pour les tests E2E
 */
export async function logout(page: Page): Promise<void> {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');

  // Attendre la redirection vers la page de login
  await page.waitForURL('/login');
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const url = page.url();
  return url.includes('/dashboard');
}
