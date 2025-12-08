/**
 * ResponseTemplate Entity - Core Domain Logic
 * RÈGLES STRICTES:
 * - ✅ AUCUN type 'any'
 * - ✅ AUCUNE dépendance externe
 * - ✅ Result Pattern pour toutes les erreurs
 * - ✅ Branded Types pour tous les IDs
 * - ✅ Types explicites partout
 */

import { Result } from '@/shared/types/result.type';
import { StoreId } from '@/shared/types/branded.type';

// Domain Errors
export class InvalidTemplateDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTemplateDataError';
  }
}

// Types
export type TemplateCategory = 'positive' | 'neutral' | 'negative';

export interface CreateResponseTemplateProps {
  readonly storeId: StoreId;
  readonly name: string;
  readonly content: string;
  readonly category: TemplateCategory;
}

export interface ResponseTemplateProps {
  readonly id: string;
  readonly storeId: StoreId;
  readonly name: string;
  readonly content: string;
  readonly category: TemplateCategory;
  readonly usageCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * ResponseTemplate Entity
 * Encapsule la logique métier des templates de réponse
 */
export class ResponseTemplateEntity {
  private constructor(private readonly props: ResponseTemplateProps) {}

  // Factory Methods
  static create(props: CreateResponseTemplateProps): Result<ResponseTemplateEntity> {
    // Validation du nom
    const trimmedName = props.name.trim();
    if (trimmedName.length === 0) {
      return Result.fail(new InvalidTemplateDataError('Template name is required'));
    }

    // Validation du contenu
    const trimmedContent = props.content.trim();
    if (trimmedContent.length === 0) {
      return Result.fail(new InvalidTemplateDataError('Template content is required'));
    }

    if (trimmedContent.length < 10) {
      return Result.fail(
        new InvalidTemplateDataError('Template content must be at least 10 characters'),
      );
    }

    if (trimmedContent.length > 5000) {
      return Result.fail(
        new InvalidTemplateDataError('Template content cannot exceed 5000 characters'),
      );
    }

    // Validation de la catégorie
    const validCategories: TemplateCategory[] = ['positive', 'neutral', 'negative'];
    if (!validCategories.includes(props.category)) {
      return Result.fail(
        new InvalidTemplateDataError(
          `Invalid category: ${props.category}. Must be one of: ${validCategories.join(', ')}`,
        ),
      );
    }

    const now = new Date();
    const templateId = this.generateTemplateId();

    const template = new ResponseTemplateEntity({
      id: templateId,
      storeId: props.storeId,
      name: trimmedName,
      content: trimmedContent,
      category: props.category,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok(template);
  }

  static fromPersistence(props: ResponseTemplateProps): ResponseTemplateEntity {
    return new ResponseTemplateEntity(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get storeId(): StoreId {
    return this.props.storeId;
  }

  get name(): string {
    return this.props.name;
  }

  get content(): string {
    return this.props.content;
  }

  get category(): TemplateCategory {
    return this.props.category;
  }

  get usageCount(): number {
    return this.props.usageCount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Logic
  incrementUsage(): ResponseTemplateEntity {
    return new ResponseTemplateEntity({
      ...this.props,
      usageCount: this.props.usageCount + 1,
      updatedAt: new Date(),
    });
  }

  updateContent(newContent: string): Result<ResponseTemplateEntity> {
    const trimmedContent = newContent.trim();

    if (trimmedContent.length === 0) {
      return Result.fail(new InvalidTemplateDataError('Template content is required'));
    }

    if (trimmedContent.length < 10) {
      return Result.fail(
        new InvalidTemplateDataError('Template content must be at least 10 characters'),
      );
    }

    if (trimmedContent.length > 5000) {
      return Result.fail(
        new InvalidTemplateDataError('Template content cannot exceed 5000 characters'),
      );
    }

    const updatedTemplate = new ResponseTemplateEntity({
      ...this.props,
      content: trimmedContent,
      updatedAt: new Date(),
    });

    return Result.ok(updatedTemplate);
  }

  isPopular(): boolean {
    return this.props.usageCount >= 10;
  }

  matchesCategory(category: TemplateCategory): boolean {
    return this.props.category === category;
  }

  // Private Helpers
  private static generateTemplateId(): string {
    // In real app, this would use a proper ID generator (CUID)
    return `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Serialization
  toPersistence(): ResponseTemplateProps {
    return {
      ...this.props,
    };
  }
}
