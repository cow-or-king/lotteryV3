/**
 * Create Response Template Use Case
 * Crée un nouveau template de réponse pour un store
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/shared/types/result.type';
import { ResponseTemplateEntity, TemplateCategory } from '@/core/entities/response-template.entity';
import { IResponseTemplateRepository } from '@/core/repositories/response-template.repository.interface';
import { StoreId } from '@/shared/types/branded.type';

// DTO pour l'input
export interface CreateResponseTemplateInput {
  readonly storeId: StoreId;
  readonly name: string;
  readonly content: string;
  readonly category: TemplateCategory;
}

// DTO pour l'output
export interface CreateResponseTemplateOutput {
  readonly templateId: string;
  readonly name: string;
  readonly content: string;
  readonly category: TemplateCategory;
  readonly usageCount: number;
}

// Domain Errors
export class InvalidTemplateDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTemplateDataError';
  }
}

/**
 * Use Case: Create Response Template
 * Crée un nouveau template de réponse
 */
export class CreateResponseTemplateUseCase {
  constructor(private readonly templateRepository: IResponseTemplateRepository) {}

  async execute(input: CreateResponseTemplateInput): Promise<Result<CreateResponseTemplateOutput>> {
    // 1. Valider les données
    if (!input.name || input.name.trim().length === 0) {
      return Result.fail(new InvalidTemplateDataError('Template name is required'));
    }

    if (!input.content || input.content.trim().length < 10) {
      return Result.fail(
        new InvalidTemplateDataError('Template content must be at least 10 characters'),
      );
    }

    if (input.content.length > 5000) {
      return Result.fail(
        new InvalidTemplateDataError('Template content cannot exceed 5000 characters'),
      );
    }

    // 2. Créer l'entité template
    const templateResult = ResponseTemplateEntity.create({
      storeId: input.storeId,
      name: input.name,
      content: input.content,
      category: input.category,
    });

    if (!templateResult.success) {
      return Result.fail(templateResult.error);
    }

    // 3. Sauvegarder le template
    const saveResult = await this.templateRepository.create({
      storeId: input.storeId,
      name: input.name,
      content: input.content,
      category: input.category,
    });

    if (!saveResult.success) {
      return Result.fail(saveResult.error);
    }

    const template = saveResult.data;

    // 4. Retourner les informations du template créé
    return Result.ok({
      templateId: template.id,
      name: template.name,
      content: template.content,
      category: template.category,
      usageCount: template.usageCount,
    });
  }
}
