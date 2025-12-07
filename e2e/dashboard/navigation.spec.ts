/**
 * E2E Tests - Dashboard Navigation
 * Tests E2E pour la navigation dans le dashboard
 * IMPORTANT: ZERO any types
 */

import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/users';
import { login } from '../utils/auth';

test.describe('Dashboard - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin);
  });

  test('devrait afficher le menu de navigation', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Vérifier la présence des liens principaux
    await expect(page.locator('a:has-text("Tableau de bord")')).toBeVisible();
    await expect(page.locator('a:has-text("Gains & Lots")')).toBeVisible();
    await expect(page.locator('a:has-text("Enseignes")')).toBeVisible();
    await expect(page.locator('a:has-text("Magasins")')).toBeVisible();
  });

  test('devrait naviguer vers la page des gains', async ({ page }) => {
    await page.click('a:has-text("Gains & Lots")');
    await expect(page).toHaveURL(/\/dashboard\/prizes/);
    await expect(page.locator('h1:has-text("Gains & Lots")')).toBeVisible();
  });

  test('devrait naviguer vers la page des enseignes', async ({ page }) => {
    await page.click('a:has-text("Enseignes")');
    await expect(page).toHaveURL(/\/dashboard\/brands/);
    await expect(page.locator('h1:has-text("Enseignes")')).toBeVisible();
  });

  test('devrait naviguer vers la page des magasins', async ({ page }) => {
    await page.click('a:has-text("Magasins")');
    await expect(page).toHaveURL(/\/dashboard\/stores/);
    await expect(page.locator('h1:has-text("Magasins")')).toBeVisible();
  });

  test('devrait mettre en surbrillance le lien actif', async ({ page }) => {
    await page.click('a:has-text("Gains & Lots")');

    const activeLink = page.locator('a:has-text("Gains & Lots")');
    await expect(activeLink).toHaveClass(/active|bg-purple/);
  });

  test('devrait afficher le menu utilisateur', async ({ page }) => {
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible();

    // Cliquer pour ouvrir le menu
    await userMenu.click();

    // Vérifier les options
    await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
  });

  test('devrait être responsive sur mobile', async ({ page }) => {
    // Changer le viewport pour mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Vérifier que le menu burger est visible
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(menuButton).toBeVisible();

    // Ouvrir le menu mobile
    await menuButton.click();

    // Vérifier que les liens de navigation sont visibles
    await expect(page.locator('a:has-text("Tableau de bord")')).toBeVisible();
  });
});
