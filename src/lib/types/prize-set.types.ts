/**
 * Prize Set Types
 * Types pour les lots de gains
 * IMPORTANT: ZERO any types
 */

export interface EditingSet {
  id: string;
  name: string;
  description: string;
  brandId: string;
}

export interface SetFormData {
  brandId: string;
  name: string;
  description: string;
}

export interface SelectedItem {
  prizeTemplateId: string;
  probability: number;
  quantity: number;
}

export interface PrizeTemplate {
  id: string;
  brandId: string | null;
  name: string;
  description: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  color: string;
  iconUrl: string | null;
}

export interface PrizeSetItem {
  prizeTemplateId: string;
  probability: number;
  quantity: number;
}

export interface PrizeSet {
  id: string;
  name: string;
  description: string | null;
  brandId: string;
  items?: PrizeSetItem[];
}
