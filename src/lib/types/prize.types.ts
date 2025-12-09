/**
 * Types partagés pour les prizes (templates et sets)
 * Centralise les interfaces pour éviter la duplication
 */

export interface PrizeTemplateDTO {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  value: number;
  isPremium: boolean;
  isActive: boolean;
  stock: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PrizeItemDTO {
  id: string;
  prizeTemplateId: string;
  probability: number;
  maxQuantity: number | null;
  isActive: boolean;
  prizeTemplate?: PrizeTemplateDTO;
}

export interface PrizeSetDTO {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  totalProbability: number;
  items: PrizeItemDTO[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PrizeTemplateFormData {
  name: string;
  description: string;
  imageUrl: string;
  value: string;
  isPremium: boolean;
  stock: string;
}

export interface PrizeSetFormData {
  name: string;
  description: string;
  items: Array<{
    prizeTemplateId: string;
    probability: string;
    maxQuantity: string;
  }>;
}

export interface PrizeFormErrors {
  name?: string;
  description?: string;
  imageUrl?: string;
  value?: string;
  stock?: string;
}
