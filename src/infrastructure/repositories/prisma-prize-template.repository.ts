/**
 * Prisma PrizeTemplate Repository Adapter
 * Implémentation Prisma du port PrizeTemplateRepository
 * Architecture hexagonale: Adapter dans l'infrastructure
 */

import { prisma } from '@/infrastructure/database/prisma-client';
import type {
  PrizeTemplateRepository,
  PrizeTemplateEntity,
  CreatePrizeTemplateInput,
  UpdatePrizeTemplateInput,
} from '@/core/ports/prize-template.repository';

export class PrismaPrizeTemplateRepository implements PrizeTemplateRepository {
  async create(input: CreatePrizeTemplateInput): Promise<PrizeTemplateEntity> {
    return await prisma.prizeTemplate.create({
      data: {
        name: input.name,
        brandId: input.brandId,
        ownerId: input.ownerId,
        description: input.description || null,
        minPrice: input.minPrice || null,
        maxPrice: input.maxPrice || null,
        color: input.color || '#8B5CF6',
        iconUrl: input.iconUrl || null,
      },
    });
  }

  async findById(id: string): Promise<PrizeTemplateEntity | null> {
    return await prisma.prizeTemplate.findUnique({
      where: { id },
    });
  }

  async findManyByBrandId(brandId: string): Promise<PrizeTemplateEntity[]> {
    return await prisma.prizeTemplate.findMany({
      where: { brandId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findManyByOwnerId(ownerId: string): Promise<PrizeTemplateEntity[]> {
    return await prisma.prizeTemplate.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, input: UpdatePrizeTemplateInput): Promise<PrizeTemplateEntity> {
    return await prisma.prizeTemplate.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.minPrice !== undefined && { minPrice: input.minPrice }),
        ...(input.maxPrice !== undefined && { maxPrice: input.maxPrice }),
        ...(input.color !== undefined && { color: input.color }),
        ...(input.iconUrl !== undefined && { iconUrl: input.iconUrl }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.prizeTemplate.delete({
      where: { id },
    });
  }

  async countByBrandId(brandId: string): Promise<number> {
    return await prisma.prizeTemplate.count({
      where: { brandId },
    });
  }
}
