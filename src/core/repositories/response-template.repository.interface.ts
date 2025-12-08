/**
 * ResponseTemplate Repository Interface
 * Port pour l'acc�s aux donn�es des templates de r�ponse
 * IMPORTANT: Interface uniquement, ZERO impl�mentation ici
 */

import { Result } from '@/shared/types/result.type';
import { ResponseTemplateEntity, TemplateCategory } from '@/core/entities/response-template.entity';
import { StoreId } from '@/shared/types/branded.type';

export interface CreateResponseTemplateData {
  readonly storeId: StoreId;
  readonly name: string;
  readonly content: string;
  readonly category: TemplateCategory;
}

export interface UpdateResponseTemplateData {
  readonly name?: string;
  readonly content?: string;
  readonly category?: TemplateCategory;
}

export interface IResponseTemplateRepository {
  /**
   * Trouve un template par son ID
   */
  findById(id: string): Promise<ResponseTemplateEntity | null>;

  /**
   * Liste tous les templates d'un store
   */
  findByStore(storeId: StoreId): Promise<ReadonlyArray<ResponseTemplateEntity>>;

  /**
   * Liste les templates par cat�gorie
   */
  findByStoreAndCategory(
    storeId: StoreId,
    category: TemplateCategory,
  ): Promise<ReadonlyArray<ResponseTemplateEntity>>;

  /**
   * Liste les templates populaires (>= 10 utilisations)
   */
  findPopularByStore(storeId: StoreId): Promise<ReadonlyArray<ResponseTemplateEntity>>;

  /**
   * Cr�e un nouveau template
   */
  create(data: CreateResponseTemplateData): Promise<Result<ResponseTemplateEntity>>;

  /**
   * Met � jour un template
   */
  update(id: string, data: UpdateResponseTemplateData): Promise<Result<ResponseTemplateEntity>>;

  /**
   * Sauvegarde un template (update entit� compl�te)
   */
  save(template: ResponseTemplateEntity): Promise<Result<ResponseTemplateEntity>>;

  /**
   * Supprime un template
   */
  delete(id: string): Promise<Result<void>>;

  /**
   * Incr�mente le compteur d'utilisation d'un template
   */
  incrementUsage(id: string): Promise<Result<void>>;

  /**
   * Compte le nombre de templates par store
   */
  countByStore(storeId: StoreId): Promise<number>;
}
