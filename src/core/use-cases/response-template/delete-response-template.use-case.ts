/**
 * Delete Response Template Use Case
 * Supprime un template de réponse
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/shared/types/result.type';
import { IResponseTemplateRepository } from '@/core/repositories/response-template.repository.interface';

// DTO pour l'input
export interface DeleteResponseTemplateInput {
  readonly templateId: string;
}

// DTO pour l'output
export interface DeleteResponseTemplateOutput {
  readonly success: boolean;
}

// Domain Errors
export class TemplateNotFoundError extends Error {
  constructor(templateId: string) {
    super(`Template ${templateId} not found`);
    this.name = 'TemplateNotFoundError';
  }
}

/**
 * Use Case: Delete Response Template
 * Supprime un template de réponse
 */
export class DeleteResponseTemplateUseCase {
  constructor(private readonly templateRepository: IResponseTemplateRepository) {}

  async execute(input: DeleteResponseTemplateInput): Promise<Result<DeleteResponseTemplateOutput>> {
    // 1. Vérifier que le template existe
    const template = await this.templateRepository.findById(input.templateId);

    if (!template) {
      return Result.fail(new TemplateNotFoundError(input.templateId));
    }

    // 2. Supprimer le template
    const deleteResult = await this.templateRepository.delete(input.templateId);

    if (!deleteResult.success) {
      return Result.fail(deleteResult.error);
    }

    // 3. Retourner le succès
    return Result.ok({
      success: true,
    });
  }
}
