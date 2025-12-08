/**
 * Update Response Template Use Case
 * Met à jour un template de réponse existant
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/shared/types/result.type';
import { ResponseTemplateEntity, TemplateCategory } from '@/core/entities/response-template.entity';
import { IResponseTemplateRepository } from '@/core/repositories/response-template.repository.interface';

// DTO pour l'input
export interface UpdateResponseTemplateInput {
  readonly templateId: string;
  readonly name?: string;
  readonly content?: string;
  readonly category?: TemplateCategory;
}

// DTO pour l'output
export interface UpdateResponseTemplateOutput {
  readonly templateId: string;
  readonly name: string;
  readonly content: string;
  readonly category: TemplateCategory;
  readonly usageCount: number;
}

// Domain Errors
export class TemplateNotFoundError extends Error {
  constructor(templateId: string) {
    super(`Template ${templateId} not found`);
    this.name = 'TemplateNotFoundError';
  }
}

export class InvalidTemplateUpdateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTemplateUpdateError';
  }
}

/**
 * Use Case: Update Response Template
 * Met à jour un template de réponse existant
 */
export class UpdateResponseTemplateUseCase {
  constructor(private readonly templateRepository: IResponseTemplateRepository) {}

  async execute(input: UpdateResponseTemplateInput): Promise<Result<UpdateResponseTemplateOutput>> {
    // 1. Récupérer le template existant
    const template = await this.templateRepository.findById(input.templateId);

    if (!template) {
      return Result.fail(new TemplateNotFoundError(input.templateId));
    }

    // 2. Appliquer les modifications
    let updatedTemplate = template;

    if (input.name !== undefined) {
      const nameResult = updatedTemplate.updateName(input.name);
      if (!nameResult.success) {
        return Result.fail(nameResult.error);
      }
      updatedTemplate = nameResult.data;
    }

    if (input.content !== undefined) {
      const contentResult = updatedTemplate.updateContent(input.content);
      if (!contentResult.success) {
        return Result.fail(contentResult.error);
      }
      updatedTemplate = contentResult.data;
    }

    if (input.category !== undefined) {
      const categoryResult = updatedTemplate.updateCategory(input.category);
      if (!categoryResult.success) {
        return Result.fail(categoryResult.error);
      }
      updatedTemplate = categoryResult.data;
    }

    // 3. Sauvegarder les modifications
    const saveResult = await this.templateRepository.update(input.templateId, {
      name: input.name,
      content: input.content,
      category: input.category,
    });

    if (!saveResult.success) {
      return Result.fail(saveResult.error);
    }

    const saved = saveResult.data;

    // 4. Retourner le template mis à jour
    return Result.ok({
      templateId: saved.id,
      name: saved.name,
      content: saved.content,
      category: saved.category,
      usageCount: saved.usageCount,
    });
  }
}
