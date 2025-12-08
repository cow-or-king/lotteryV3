/**
 * Prisma Store Repository Adapter
 * Implémentation Prisma du port StoreRepository
 * Architecture hexagonale: Adapter dans l'infrastructure
 */

import { prisma } from '@/infrastructure/database/prisma-client';
import type {
  StoreRepository,
  StoreEntity,
  CreateStoreInput,
  UpdateStoreInput,
} from '@/core/ports/store.repository';

export class PrismaStoreRepository implements StoreRepository {
  async create(input: CreateStoreInput): Promise<StoreEntity> {
    return await prisma.store.create({
      data: {
        name: input.name,
        slug: input.slug,
        googleBusinessUrl: input.googleBusinessUrl,
        googlePlaceId: input.googlePlaceId || null,
        description: input.description || null,
        isActive: input.isActive ?? true,
        isPaid: input.isPaid,
        brandId: input.brandId,
      },
    });
  }

  async findById(id: string): Promise<StoreEntity | null> {
    return await prisma.store.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<StoreEntity | null> {
    return await prisma.store.findUnique({
      where: { slug },
    });
  }

  async findManyByBrandId(brandId: string): Promise<StoreEntity[]> {
    return await prisma.store.findMany({
      where: { brandId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findManyByOwnerId(ownerId: string): Promise<StoreEntity[]> {
    return await prisma.store.findMany({
      where: {
        brand: {
          ownerId,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, input: UpdateStoreInput): Promise<StoreEntity> {
    return await prisma.store.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.googleBusinessUrl && { googleBusinessUrl: input.googleBusinessUrl }),
        ...(input.googlePlaceId !== undefined && { googlePlaceId: input.googlePlaceId }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        // Gestion de la clé API Google chiffrée + statut
        ...(input.googleApiKey !== undefined && {
          googlePlacesApiKey: input.googleApiKey,
          googleApiKeyStatus: input.googleApiKey ? 'configured' : 'not_configured',
        }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.store.delete({
      where: { id },
    });
  }

  async countByBrandId(brandId: string): Promise<number> {
    return await prisma.store.count({
      where: { brandId },
    });
  }
}
