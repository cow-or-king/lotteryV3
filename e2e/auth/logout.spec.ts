/**
 * E2E Tests - Authentication / Logout
 * Tests E2E pour la déconnexion
 * IMPORTANT: ZERO any types
 */

import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/users';
import { login, logout } from '../utils/auth';

test.describe('Authentication - Logout', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter avant chaque test
    await login(page, testUsers.admin);
  });

  test('devrait se déconnecter avec succès', async ({ page }) => {
    await logout(page);

    // Vérifier la redirection vers la page de login
    await expect(page).toHaveURL(/\/login/);
  });

  test('devrait rediriger vers login si on accède au dashboard après déconnexion', async ({
    page,
  }) => {
    await logout(page);

    // Essayer d'accéder au dashboard
    await page.goto('/dashboard');

    // Devrait être redirigé vers login
    await expect(page).toHaveURL(/\/login/);
  });

  test('devrait supprimer la session utilisateur', async ({ page }) => {
    await logout(page);

    // Vérifier que les cookies de session sont supprimés
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name.includes('session'));
    expect(sessionCookie).toBeUndefined();
  });
});
