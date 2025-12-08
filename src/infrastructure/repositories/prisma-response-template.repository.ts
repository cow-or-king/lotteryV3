/**
 * Prisma ResponseTemplate Repository
 * Implémentation Prisma de IResponseTemplateRepository
 * IMPORTANT: Couche infrastructure, dépendance à Prisma OK
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { Result } from '@/shared/types/result.type';
import { ResponseTemplateEntity, TemplateCategory } from '@/core/entities/response-template.entity';
import {
  IResponseTemplateRepository,
  CreateResponseTemplateData,
  UpdateResponseTemplateData,
} from '@/core/repositories/response-template.repository.interface';
import { StoreId } from '@/shared/types/branded.type';
import * as TemplateMapper from './mappers/response-template.mapper';

export class PrismaResponseTemplateRepository implements IResponseTemplateRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ResponseTemplateEntity | null> {
    const template = await this.prisma.responseTemplate.findUnique({
      where: { id },
    });

    return template ? TemplateMapper.toDomain(template) : null;
  }

  async findByStore(storeId: StoreId): Promise<readonly ResponseTemplateEntity[]> {
    const templates = await this.prisma.responseTemplate.findMany({
      where: { storeId },
      orderBy: [{ usageCount: 'desc' }, { name: 'asc' }],
    });

    return templates.map(TemplateMapper.toDomain);
  }

  async findByStoreAndCategory(
    storeId: StoreId,
    category: TemplateCategory,
  ): Promise<readonly ResponseTemplateEntity[]> {
    const templates = await this.prisma.responseTemplate.findMany({
      where: {
        storeId,
        category,
      },
      orderBy: [{ usageCount: 'desc' }, { name: 'asc' }],
    });

    return templates.map(TemplateMapper.toDomain);
  }

  async findPopularByStore(storeId: StoreId): Promise<readonly ResponseTemplateEntity[]> {
    const templates = await this.prisma.responseTemplate.findMany({
      where: {
        storeId,
        usageCount: { gte: 10 },
      },
      orderBy: [{ usageCount: 'desc' }, { name: 'asc' }],
    });

    return templates.map(TemplateMapper.toDomain);
  }

  async create(data: CreateResponseTemplateData): Promise<Result<ResponseTemplateEntity>> {
    try {
      const prismaData = TemplateMapper.toCreateData(data);

      const template = await this.prisma.responseTemplate.create({
        data: prismaData,
      });

      return Result.ok(TemplateMapper.toDomain(template));
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async update(
    id: string,
    data: UpdateResponseTemplateData,
  ): Promise<Result<ResponseTemplateEntity>> {
    try {
      const template = await this.prisma.responseTemplate.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return Result.ok(TemplateMapper.toDomain(template));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return Result.fail(new Error(`Template ${id} not found`));
        }
      }
      return Result.fail(error as Error);
    }
  }

  async save(template: ResponseTemplateEntity): Promise<Result<ResponseTemplateEntity>> {
    try {
      const updated = await this.prisma.responseTemplate.update({
        where: { id: template.id },
        data: {
          name: template.name,
          content: template.content,
          category: template.category,
          usageCount: template.usageCount,
          updatedAt: new Date(),
        },
      });

      return Result.ok(TemplateMapper.toDomain(updated));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return Result.fail(new Error(`Template ${template.id} not found`));
        }
      }
      return Result.fail(error as Error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.responseTemplate.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return Result.fail(new Error(`Template ${id} not found`));
        }
      }
      return Result.fail(error as Error);
    }
  }

  async incrementUsage(id: string): Promise<Result<void>> {
    try {
      await this.prisma.responseTemplate.update({
        where: { id },
        data: {
          usageCount: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return Result.fail(new Error(`Template ${id} not found`));
        }
      }
      return Result.fail(error as Error);
    }
  }

  async countByStore(storeId: StoreId): Promise<number> {
    return this.prisma.responseTemplate.count({
      where: { storeId },
    });
  }
}
