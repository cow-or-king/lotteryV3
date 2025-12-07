/**
 * Prisma PrizeSet Repository Adapter
 * Implémentation Prisma du port PrizeSetRepository
 * Architecture hexagonale: Adapter dans l'infrastructure
 */

import { prisma } from '@/infrastructure/database/prisma-client';
import type {
  PrizeSetRepository,
  PrizeSetEntity,
  PrizeSetWithItems,
  PrizeSetItemEntity,
  CreatePrizeSetInput,
  UpdatePrizeSetInput,
  AddPrizeSetItemInput,
  UpdatePrizeSetItemInput,
} from '@/core/ports/prize-set.repository';

export class PrismaPrizeSetRepository implements PrizeSetRepository {
  async create(input: CreatePrizeSetInput): Promise<PrizeSetEntity> {
    return await prisma.prizeSet.create({
      data: {
        name: input.name,
        brandId: input.brandId,
        description: input.description || null,
      },
    });
  }

  async findById(id: string): Promise<PrizeSetWithItems | null> {
    const prizeSet = await prisma.prizeSet.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            prizeTemplate: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return prizeSet;
  }

  async findManyByBrandId(brandId: string): Promise<PrizeSetWithItems[]> {
    return await prisma.prizeSet.findMany({
      where: { brandId },
      include: {
        items: {
          include: {
            prizeTemplate: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, input: UpdatePrizeSetInput): Promise<PrizeSetEntity> {
    return await prisma.prizeSet.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.prizeSet.delete({
      where: { id },
    });
  }

  async countByBrandId(brandId: string): Promise<number> {
    return await prisma.prizeSet.count({
      where: { brandId },
    });
  }

  // Prize Set Items operations
  async addItem(input: AddPrizeSetItemInput): Promise<PrizeSetItemEntity> {
    return await prisma.prizeSetItem.create({
      data: {
        prizeSetId: input.prizeSetId,
        prizeTemplateId: input.prizeTemplateId,
        probability: input.probability,
        quantity: input.quantity,
      },
    });
  }

  async removeItem(prizeSetId: string, prizeTemplateId: string): Promise<void> {
    await prisma.prizeSetItem.deleteMany({
      where: {
        prizeSetId,
        prizeTemplateId,
      },
    });
  }

  async updateItem(
    prizeSetId: string,
    prizeTemplateId: string,
    input: UpdatePrizeSetItemInput,
  ): Promise<PrizeSetItemEntity> {
    // Trouver l'item d'abord
    const item = await prisma.prizeSetItem.findFirst({
      where: {
        prizeSetId,
        prizeTemplateId,
      },
    });

    if (!item) {
      throw new Error('Prize set item not found');
    }

    // Mettre à jour l'item
    return await prisma.prizeSetItem.update({
      where: { id: item.id },
      data: {
        ...(input.probability !== undefined && { probability: input.probability }),
        ...(input.quantity !== undefined && { quantity: input.quantity }),
      },
    });
  }

  async findItemsByPrizeSetId(prizeSetId: string): Promise<PrizeSetItemEntity[]> {
    return await prisma.prizeSetItem.findMany({
      where: { prizeSetId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
