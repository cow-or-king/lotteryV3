/**
 * E2E Tests - Authentication / Login
 * Tests E2E pour la page de connexion
 * IMPORTANT: ZERO any types
 */

import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/users';
import { login } from '../utils/auth';

test.describe('Authentication - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('devrait afficher la page de connexion', async ({ page }) => {
    await expect(page).toHaveTitle(/Review Lottery/);
    await expect(page.locator('h1')).toContainText(/connexion/i);
  });

  test('devrait afficher les champs email et password', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('devrait afficher une erreur avec des credentials invalides', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Attendre le toast d'erreur
    await expect(page.locator('[role="status"]')).toBeVisible();
    await expect(page.locator('[role="status"]')).toContainText(/erreur/i);
  });

  test('devrait se connecter avec des credentials valides', async ({ page }) => {
    await login(page, testUsers.admin);

    // Vérifier la redirection vers le dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Vérifier la présence du menu utilisateur
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible();
  });

  test('devrait rediriger vers le dashboard si déjà connecté', async ({ page }) => {
    // Se connecter d'abord
    await login(page, testUsers.admin);

    // Essayer d'accéder à la page de login
    await page.goto('/login');

    // Devrait être redirigé vers le dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("devrait valider le format de l'email", async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'Test123456!');
    await page.click('button[type="submit"]');

    // Vérifier le message d'erreur de validation
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('devrait afficher/masquer le mot de passe', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page.locator('[data-testid="toggle-password"]');

    // Par défaut, le type devrait être "password"
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Cliquer sur le bouton pour afficher
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Cliquer à nouveau pour masquer
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
