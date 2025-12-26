/**
 * Simple Prize Repository
 * Implémentation minimale pour les opérations Prize
 * IMPORTANT: ZERO any types
 */

import { prisma } from '@/infrastructure/database/prisma-client';

export class SimplePrizeRepository {
  async decrementRemaining(prizeId: string): Promise<void> {
    await prisma.prize.update({
      where: { id: prizeId },
      data: {
        remaining: {
          decrement: 1,
        },
      },
    });
  }
}
