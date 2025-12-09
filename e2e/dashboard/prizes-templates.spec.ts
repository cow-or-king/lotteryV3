/**
 * E2E Tests - Prize Templates (Gains)
 * Tests E2E pour la gestion des modèles de gains
 * IMPORTANT: ZERO any types
 */

import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/users';
import { login } from '../utils/auth';

test.describe('Dashboard - Prize Templates', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin);
    await page.goto('/dashboard/prizes');
    // S'assurer d'être sur l'onglet des modèles
    await page.click('button:has-text("Modèles de gains")');
  });

  test('devrait afficher la liste des modèles de gains', async ({ page }) => {
    await expect(page.locator('h2:has-text("Modèles de gains")')).toBeVisible();

    // Vérifier la présence du bouton de création
    const createButton = page.locator('button:has-text("Créer un modèle")');
    await expect(createButton).toBeVisible();
  });

  test('devrait ouvrir le formulaire de création de modèle', async ({ page }) => {
    await page.click('button:has-text("Créer un modèle")');

    // Vérifier que le formulaire est affiché
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('input[name="value"]')).toBeVisible();
  });

  test('devrait créer un nouveau modèle de gain', async ({ page }) => {
    await page.click('button:has-text("Créer un modèle")');

    // Remplir le formulaire
    await page.fill('input[name="name"]', 'Gain Test E2E');
    await page.fill('textarea[name="description"]', 'Description du gain test');
    await page.fill('input[name="value"]', '100');
    await page.selectOption('select[name="type"]', 'cash');

    // Soumettre le formulaire
    await page.click('button[type="submit"]');

    // Vérifier le toast de succès
    await expect(page.locator('[role="status"]')).toContainText(/créé/i);

    // Vérifier que le nouveau gain apparaît dans la liste
    await expect(page.locator('text=Gain Test E2E')).toBeVisible();
  });

  test('devrait valider les champs requis', async ({ page }) => {
    await page.click('button:has-text("Créer un modèle")');

    // Soumettre sans remplir
    await page.click('button[type="submit"]');

    // Vérifier les messages d'erreur de validation
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('devrait éditer un modèle existant', async ({ page }) => {
    // Cliquer sur le bouton d'édition du premier gain
    await page.locator('[data-testid="edit-template-button"]').first().click();

    // Modifier le nom
    const nameInput = page.locator('input[name="name"]');
    await nameInput.clear();
    await nameInput.fill('Gain Modifié E2E');

    // Soumettre
    await page.click('button[type="submit"]');

    // Vérifier le toast de succès
    await expect(page.locator('[role="status"]')).toContainText(/modifié/i);

    // Vérifier que le nom a changé
    await expect(page.locator('text=Gain Modifié E2E')).toBeVisible();
  });

  test('devrait supprimer un modèle', async ({ page }) => {
    // Cliquer sur le bouton de suppression
    await page.locator('[data-testid="delete-template-button"]').first().click();

    // Confirmer la suppression dans le dialog
    await page.click('button:has-text("Confirmer")');

    // Vérifier le toast de succès
    await expect(page.locator('[role="status"]')).toContainText(/supprimé/i);
  });

  test('devrait filtrer les gains par enseigne', async ({ page }) => {
    // Sélectionner une enseigne dans le filtre
    const brandFilter = page.locator('select[name="brandFilter"]');
    await brandFilter.selectOption({ index: 1 });

    // Attendre que la liste se mette à jour
    await page.waitForTimeout(500);

    // Vérifier que la liste est filtrée
    // (nécessite d'avoir des données de test appropriées)
  });

  test('devrait gérer les gains communs (brandId null)', async ({ page }) => {
    await page.click('button:has-text("Créer un modèle")');

    // Remplir le formulaire
    await page.fill('input[name="name"]', 'Gain Commun Test');
    await page.fill('textarea[name="description"]', 'Gain disponible pour toutes les enseignes');
    await page.fill('input[name="value"]', '50');

    // NE PAS sélectionner d'enseigne (brandId = null)
    const brandSelect = page.locator('select[name="brandId"]');
    await brandSelect.selectOption('');

    // Soumettre
    await page.click('button[type="submit"]');

    // Vérifier que le gain commun est créé
    await expect(page.locator('[role="status"]')).toContainText(/créé/i);

    // Vérifier la présence d'un badge "Commun"
    await expect(page.locator('text=Commun')).toBeVisible();
  });

  test("devrait afficher les détails d'un modèle", async ({ page }) => {
    // Cliquer sur un gain pour voir les détails
    await page.locator('[data-testid="view-template-details"]').first().click();

    // Vérifier l'affichage des détails
    await expect(page.locator('[data-testid="template-details"]')).toBeVisible();
    await expect(page.locator('text=Nom')).toBeVisible();
    await expect(page.locator('text=Description')).toBeVisible();
    await expect(page.locator('text=Valeur')).toBeVisible();
    await expect(page.locator('text=Type')).toBeVisible();
  });
});
