/**
 * ResponseTemplate Mapper
 * Transforme entre Prisma models et Domain entities
 * IMPORTANT: Couche infrastructure, dépendance à Prisma OK
 */

import { ResponseTemplate as PrismaResponseTemplate } from '@prisma/client';
import {
  ResponseTemplateEntity,
  ResponseTemplateProps,
  CreateResponseTemplateProps,
  TemplateCategory,
} from '@/core/entities/response-template.entity';
import { StoreId } from '@/shared/types/branded.type';

/**
 * Convertit un modèle Prisma en props d'entité Domain
 */
export function toDomainProps(prismaTemplate: PrismaResponseTemplate): ResponseTemplateProps {
  return {
    id: prismaTemplate.id,
    storeId: prismaTemplate.storeId as StoreId,
    name: prismaTemplate.name,
    content: prismaTemplate.content,
    category: prismaTemplate.category as TemplateCategory,
    usageCount: prismaTemplate.usageCount,
    createdAt: prismaTemplate.createdAt,
    updatedAt: prismaTemplate.updatedAt,
  };
}

/**
 * Convertit un modèle Prisma en entité Domain
 */
export function toDomain(prismaTemplate: PrismaResponseTemplate): ResponseTemplateEntity {
  return ResponseTemplateEntity.fromPersistence(toDomainProps(prismaTemplate));
}

/**
 * Convertit des props de création en données Prisma
 */
export function toCreateData(props: CreateResponseTemplateProps) {
  return {
    storeId: props.storeId,
    name: props.name,
    content: props.content,
    category: props.category,
  };
}
