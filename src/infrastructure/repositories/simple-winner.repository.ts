/**
 * Simple Winner Repository
 * Implémentation minimale pour les opérations Winner
 * IMPORTANT: ZERO any types
 */

import { prisma } from '@/infrastructure/database/prisma-client';

export class SimpleWinnerRepository {
  async create(data: {
    prizeId: string;
    participantEmail: string;
    participantName: string;
    claimCode: string;
    expiresAt: Date;
    status: string;
  }): Promise<void> {
    await prisma.winner.create({
      data: {
        prizeId: data.prizeId,
        participantEmail: data.participantEmail,
        participantName: data.participantName,
        claimCode: data.claimCode,
        expiresAt: data.expiresAt,
        status: data.status,
      },
    });
  }
}
