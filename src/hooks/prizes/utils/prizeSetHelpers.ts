/**
 * Prize Set Helpers
 * Fonctions utilitaires pour les prize sets
 * IMPORTANT: ZERO any types
 */

import type { SelectedItem, PrizeTemplate } from '@/lib/types/prize-set.types';

/**
 * Calcule la probabilité totale des items sélectionnés
 */
export function calculateTotalProbability(selectedItems: SelectedItem[]): number {
  return selectedItems.reduce((sum, item) => sum + item.probability, 0);
}

/**
 * Filtre les templates de prix disponibles selon la brand
 */
export function filterAvailablePrizeTemplates(
  prizeTemplates: PrizeTemplate[] | undefined,
  brandId: string | undefined,
): PrizeTemplate[] {
  if (!prizeTemplates || !brandId) return [];
  return prizeTemplates.filter(
    (template) => template.brandId === null || template.brandId === brandId,
  );
}

/**
 * Toggle un template dans la liste des items sélectionnés
 */
export function togglePrizeTemplate(
  selectedItems: SelectedItem[],
  templateId: string,
): SelectedItem[] {
  const exists = selectedItems.find((item) => item.prizeTemplateId === templateId);
  if (exists) {
    return selectedItems.filter((item) => item.prizeTemplateId !== templateId);
  } else {
    return [...selectedItems, { prizeTemplateId: templateId, probability: 0, quantity: 0 }];
  }
}

/**
 * Met à jour la probabilité d'un item
 */
export function updateItemProbability(
  selectedItems: SelectedItem[],
  templateId: string,
  probability: number,
): SelectedItem[] {
  return selectedItems.map((item) =>
    item.prizeTemplateId === templateId ? { ...item, probability } : item,
  );
}

/**
 * Met à jour la quantité d'un item
 */
export function updateItemQuantity(
  selectedItems: SelectedItem[],
  templateId: string,
  quantity: number,
): SelectedItem[] {
  return selectedItems.map((item) =>
    item.prizeTemplateId === templateId ? { ...item, quantity } : item,
  );
}
