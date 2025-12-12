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
import type { Result } from '@/lib/types/result.type';
import { ok, fail } from '@/lib/types/result.type';

export class PrismaBrandRepository implements BrandRepository {
  async create(input: CreateBrandInput): Promise<Result<BrandEntity>> {
    try {
      const brand = await prisma.brand.create({
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
      return ok(brand);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to create brand'));
    }
  }

  async findById(id: string): Promise<Result<BrandEntity | null>> {
    try {
      const brand = await prisma.brand.findUnique({
        where: { id },
      });
      return ok(brand);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to find brand'));
    }
  }

  async findByOwnerId(ownerId: string): Promise<Result<BrandEntity[]>> {
    try {
      const brands = await prisma.brand.findMany({
        where: { ownerId },
        orderBy: { createdAt: 'desc' },
      });
      return ok(brands);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to find brands'));
    }
  }

  async update(id: string, input: UpdateBrandInput): Promise<Result<BrandEntity>> {
    try {
      const brand = await prisma.brand.update({
        where: { id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
          ...(input.primaryColor !== undefined && {
            primaryColor: input.primaryColor ?? '#5B21B6',
          }),
          ...(input.secondaryColor !== undefined && {
            secondaryColor: input.secondaryColor ?? '#FACC15',
          }),
          ...(input.font !== undefined && { font: input.font ?? 'inter' }),
        },
      });
      return ok(brand);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to update brand'));
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.brand.delete({
        where: { id },
      });
      return ok(undefined);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to delete brand'));
    }
  }

  async countByOwnerId(ownerId: string): Promise<Result<number>> {
    try {
      const count = await prisma.brand.count({
        where: { ownerId },
      });
      return ok(count);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to count brands'));
    }
  }
}
