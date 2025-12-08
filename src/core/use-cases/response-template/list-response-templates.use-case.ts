/**
 * List Response Templates Use Case
 * Liste les templates de réponse d'un store
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/shared/types/result.type';
import { ResponseTemplateEntity, TemplateCategory } from '@/core/entities/response-template.entity';
import { IResponseTemplateRepository } from '@/core/repositories/response-template.repository.interface';
import { StoreId } from '@/shared/types/branded.type';

// DTO pour l'input
export interface ListResponseTemplatesInput {
  readonly storeId: StoreId;
  readonly category?: TemplateCategory;
  readonly popularOnly?: boolean; // >= 10 utilisations
}

// DTO pour l'output
export interface ResponseTemplateDTO {
  readonly id: string;
  readonly name: string;
  readonly content: string;
  readonly category: TemplateCategory;
  readonly usageCount: number;
  readonly isPopular: boolean;
}

export interface ListResponseTemplatesOutput {
  readonly templates: readonly ResponseTemplateDTO[];
  readonly total: number;
}

/**
 * Use Case: List Response Templates
 * Liste les templates de réponse selon les filtres
 */
export class ListResponseTemplatesUseCase {
  constructor(private readonly templateRepository: IResponseTemplateRepository) {}

  async execute(input: ListResponseTemplatesInput): Promise<Result<ListResponseTemplatesOutput>> {
    let templates: readonly ResponseTemplateEntity[];

    // 1. Récupérer les templates selon les filtres
    if (input.popularOnly) {
      templates = await this.templateRepository.findPopularByStore(input.storeId);
    } else if (input.category) {
      templates = await this.templateRepository.findByStoreAndCategory(
        input.storeId,
        input.category,
      );
    } else {
      templates = await this.templateRepository.findByStore(input.storeId);
    }

    // 2. Transformer les entités en DTOs
    const templateDTOs: ResponseTemplateDTO[] = templates.map((template) => ({
      id: template.id,
      name: template.name,
      content: template.content,
      category: template.category,
      usageCount: template.usageCount,
      isPopular: template.isPopular(),
    }));

    // 3. Retourner la liste
    return Result.ok({
      templates: templateDTOs,
      total: templateDTOs.length,
    });
  }
}
