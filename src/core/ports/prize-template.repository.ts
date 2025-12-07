/**
 * PrizeTemplate Repository Port
 * Interface pour abstraire l'accès aux prize templates
 * Architecture hexagonale: Port dans le core, Adapter dans l'infrastructure
 */

export interface PrizeTemplateEntity {
  id: string;
  brandId: string;
  name: string;
  description: string | null;
  value: number | null;
  color: string;
  iconUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePrizeTemplateInput {
  name: string;
  brandId: string;
  description?: string | null;
  value?: number | null;
  color?: string;
  iconUrl?: string | null;
}

export interface UpdatePrizeTemplateInput {
  name?: string;
  description?: string | null;
  value?: number | null;
  color?: string;
  iconUrl?: string | null;
}

export interface PrizeTemplateRepository {
  create(input: CreatePrizeTemplateInput): Promise<PrizeTemplateEntity>;
  findById(id: string): Promise<PrizeTemplateEntity | null>;
  findManyByBrandId(brandId: string): Promise<PrizeTemplateEntity[]>;
  update(id: string, input: UpdatePrizeTemplateInput): Promise<PrizeTemplateEntity>;
  delete(id: string): Promise<void>;
  countByBrandId(brandId: string): Promise<number>;
}
