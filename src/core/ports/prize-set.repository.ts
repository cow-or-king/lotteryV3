/**
 * PrizeSet Repository Port
 * Interface pour abstraire l'accès aux prize sets
 * Architecture hexagonale: Port dans le core, Adapter dans l'infrastructure
 */

import type { PrizeTemplateEntity } from './prize-template.repository';

export interface PrizeSetItemEntity {
  id: string;
  prizeSetId: string;
  prizeTemplateId: string;
  probability: number;
  quantity: number;
  createdAt: Date;
  prizeTemplate: PrizeTemplateEntity;
}

export interface PrizeSetEntity {
  id: string;
  brandId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrizeSetWithItems extends PrizeSetEntity {
  items: PrizeSetItemEntity[];
}

export interface CreatePrizeSetInput {
  name: string;
  brandId: string;
  description?: string | null;
}

export interface UpdatePrizeSetInput {
  name?: string;
  description?: string | null;
}

export interface AddPrizeSetItemInput {
  prizeSetId: string;
  prizeTemplateId: string;
  probability: number;
  quantity: number;
}

export interface UpdatePrizeSetItemInput {
  probability?: number;
  quantity?: number;
}

export interface PrizeSetRepository {
  create(input: CreatePrizeSetInput): Promise<PrizeSetEntity>;
  findById(id: string): Promise<PrizeSetWithItems | null>;
  findManyByBrandId(brandId: string): Promise<PrizeSetWithItems[]>;
  update(id: string, input: UpdatePrizeSetInput): Promise<PrizeSetEntity>;
  delete(id: string): Promise<void>;
  countByBrandId(brandId: string): Promise<number>;

  // Prize Set Items operations
  addItem(input: AddPrizeSetItemInput): Promise<PrizeSetItemEntity>;
  removeItem(prizeSetId: string, prizeTemplateId: string): Promise<void>;
  updateItem(
    prizeSetId: string,
    prizeTemplateId: string,
    input: UpdatePrizeSetItemInput,
  ): Promise<PrizeSetItemEntity>;
  findItemsByPrizeSetId(prizeSetId: string): Promise<PrizeSetItemEntity[]>;
}
