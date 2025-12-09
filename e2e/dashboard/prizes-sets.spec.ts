/**
 * E2E Tests - Prize Sets (Lots)
 * Tests E2E pour la gestion des lots de gains
 * IMPORTANT: ZERO any types
 */

import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/users';
import { login } from '../utils/auth';

test.describe('Dashboard - Prize Sets', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin);
    await page.goto('/dashboard/prizes');
    // Aller sur l'onglet des lots
    await page.click('button:has-text("Lots de gains")');
  });

  test('devrait afficher la liste des lots', async ({ page }) => {
    await expect(page.locator('h2:has-text("Lots de gains")')).toBeVisible();

    // Vérifier la présence du bouton de création
    const createButton = page.locator('button:has-text("Créer un lot")');
    await expect(createButton).toBeVisible();
  });

  test('devrait ouvrir le formulaire de création de lot', async ({ page }) => {
    await page.click('button:has-text("Créer un lot")');

    // Vérifier que le formulaire est affiché
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('input[name="totalQuantity"]')).toBeVisible();
  });

  test('devrait créer un nouveau lot', async ({ page }) => {
    await page.click('button:has-text("Créer un lot")');

    // Remplir le formulaire
    await page.fill('input[name="name"]', 'Lot Test E2E');
    await page.fill('textarea[name="description"]', 'Description du lot test');
    await page.fill('input[name="totalQuantity"]', '100');

    // Sélectionner une enseigne
    await page.selectOption('select[name="brandId"]', { index: 1 });

    // Soumettre le formulaire
    await page.click('button[type="submit"]');

    // Vérifier le toast de succès
    await expect(page.locator('[role="status"]')).toContainText(/créé/i);

    // Vérifier que le nouveau lot apparaît dans la liste
    await expect(page.locator('text=Lot Test E2E')).toBeVisible();
  });

  test('devrait ajouter des gains à un lot', async ({ page }) => {
    // Cliquer sur "Gérer les gains" pour un lot
    await page.locator('[data-testid="manage-prizes-button"]').first().click();

    // Vérifier l'affichage du modal de gestion des gains
    await expect(page.locator('[data-testid="prizes-modal"]')).toBeVisible();

    // Cocher un gain
    await page.locator('[data-testid="prize-checkbox"]').first().check();

    // Définir la quantité et la probabilité
    await page.fill('input[name="quantity"]', '10');
    await page.fill('input[name="probability"]', '0.05');

    // Ajouter le gain
    await page.click('button:has-text("Ajouter")');

    // Vérifier le toast de succès
    await expect(page.locator('[role="status"]')).toContainText(/ajouté/i);
  });

  test('devrait modifier un lot existant', async ({ page }) => {
    // Cliquer sur le bouton d'édition
    await page.locator('[data-testid="edit-set-button"]').first().click();

    // Modifier le nom
    const nameInput = page.locator('input[name="name"]');
    await nameInput.clear();
    await nameInput.fill('Lot Modifié E2E');

    // Soumettre
    await page.click('button[type="submit"]');

    // Vérifier le toast de succès
    await expect(page.locator('[role="status"]')).toContainText(/modifié/i);

    // Vérifier que le nom a changé
    await expect(page.locator('text=Lot Modifié E2E')).toBeVisible();
  });

  test('devrait supprimer un lot', async ({ page }) => {
    // Cliquer sur le bouton de suppression
    await page.locator('[data-testid="delete-set-button"]').first().click();

    // Confirmer la suppression
    await page.click('button:has-text("Confirmer")');

    // Vérifier le toast de succès
    await expect(page.locator('[role="status"]')).toContainText(/supprimé/i);
  });

  test("devrait afficher les statistiques d'un lot", async ({ page }) => {
    // Cliquer sur un lot pour voir les détails
    await page.locator('[data-testid="view-set-details"]').first().click();

    // Vérifier l'affichage des statistiques
    await expect(page.locator('[data-testid="set-stats"]')).toBeVisible();
    await expect(page.locator('text=Quantité totale')).toBeVisible();
    await expect(page.locator('text=Gains distribués')).toBeVisible();
    await expect(page.locator('text=Gains restants')).toBeVisible();
  });

  test('devrait valider que la somme des probabilités est <= 1', async ({ page }) => {
    await page.locator('[data-testid="manage-prizes-button"]').first().click();

    // Essayer d'ajouter un gain avec une probabilité > 1
    await page.check('[data-testid="prize-checkbox"]').first();
    await page.fill('input[name="quantity"]', '10');
    await page.fill('input[name="probability"]', '1.5');

    await page.click('button:has-text("Ajouter")');

    // Vérifier le message d'erreur
    await expect(page.locator('[role="status"]')).toContainText(/probabilité/i);
  });

  test('devrait filtrer les lots par enseigne', async ({ page }) => {
    // Sélectionner une enseigne dans le filtre
    const brandFilter = page.locator('select[name="brandFilter"]');
    await brandFilter.selectOption({ index: 1 });

    // Attendre que la liste se mette à jour
    await page.waitForTimeout(500);

    // Vérifier que la liste est filtrée
    // (nécessite d'avoir des données de test appropriées)
  });

  test('devrait afficher l\'enseigne ou "Commun" pour chaque lot', async ({ page }) => {
    // Vérifier qu'il y a des badges d'enseigne ou "Commun"
    const badges = page.locator('[data-testid="brand-badge"]');
    await expect(badges.first()).toBeVisible();
  });

  test("devrait gérer le statut actif/inactif d'un lot", async ({ page }) => {
    // Toggle le statut
    await page.locator('[data-testid="toggle-active-status"]').first().click();

    // Vérifier le toast de succès
    await expect(page.locator('[role="status"]')).toContainText(/statut/i);

    // Vérifier le changement visuel
    const statusBadge = page.locator('[data-testid="status-badge"]').first();
    await expect(statusBadge).toBeVisible();
  });
});
