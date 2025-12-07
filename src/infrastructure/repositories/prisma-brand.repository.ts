/**
 * Prisma Brand Repository Adapter
 * Implémentation Prisma du port BrandRepository
 * Architecture hexagonale: Adapter dans l'infrastructure
 */

import { prisma } from '@/infrastructure/database/prisma-client';
import type {
  BrandRepository,
  BrandEntity,
  CreateBrandInput,
  UpdateBrandInput,
} from '@/core/ports/brand.repository';

export class PrismaBrandRepository implements BrandRepository {
  async create(input: CreateBrandInput): Promise<BrandEntity> {
    return await prisma.brand.create({
      data: {
        name: input.name,
        logoUrl: input.logoUrl,
        owner: {
          connect: { id: input.ownerId },
        },
        ...(input.primaryColor && { primaryColor: input.primaryColor }),
        ...(input.secondaryColor && { secondaryColor: input.secondaryColor }),
        ...(input.font && { font: input.font }),
        isPaid: input.isPaid,
      },
    });
  }

  async findById(id: string): Promise<BrandEntity | null> {
    return await prisma.brand.findUnique({
      where: { id },
    });
  }

  async findByOwnerId(ownerId: string): Promise<BrandEntity[]> {
    return await prisma.brand.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, input: UpdateBrandInput): Promise<BrandEntity> {
    return await prisma.brand.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.logoUrl && { logoUrl: input.logoUrl }),
        ...(input.primaryColor !== undefined && { primaryColor: input.primaryColor }),
        ...(input.secondaryColor !== undefined && { secondaryColor: input.secondaryColor }),
        ...(input.font !== undefined && { font: input.font }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.brand.delete({
      where: { id },
    });
  }

  async countByOwnerId(ownerId: string): Promise<number> {
    return await prisma.brand.count({
      where: { ownerId },
    });
  }
}
