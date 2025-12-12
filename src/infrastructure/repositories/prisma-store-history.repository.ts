/**
 * PrismaStoreHistoryRepository
 * Implémentation Prisma du repository StoreHistory
 * IMPORTANT: ZERO any types
 */

import { prisma } from '@/infrastructure/database/prisma-client';
import type {
  StoreHistoryRepository,
  StoreHistoryCreate,
} from '@/core/ports/store-history.repository';

export class PrismaStoreHistoryRepository implements StoreHistoryRepository {
  async checkUrlUsedOnFreePlan(googleBusinessUrl: string): Promise<boolean> {
    const history = await prisma.storeHistory.findFirst({
      where: {
        googleBusinessUrl,
        wasOnFreePlan: true,
      },
    });

    return history !== null;
  }

  async create(data: StoreHistoryCreate): Promise<void> {
    await prisma.storeHistory.create({
      data: {
        googleBusinessUrl: data.googleBusinessUrl,
        storeName: data.storeName,
        userId: data.userId,
        userEmail: data.userEmail,
        wasOnFreePlan: data.wasOnFreePlan,
      },
    });
  }
}
