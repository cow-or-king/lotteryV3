/**
 * Prisma Participant Repository
 * Implémentation Prisma du port IParticipantRepository
 * Architecture Hexagonale: Adapter dans l'infrastructure
 * IMPORTANT: ZERO any types
 */

import { prisma } from '@/infrastructure/database/prisma-client';
import type {
  IParticipantRepository,
  ParticipantData,
  CreateParticipantData,
  ParticipantWithConditions,
  StorePlayedGameRecord,
  UpsertParticipantInput,
} from '@/core/repositories/participant.repository.interface';
import type { Result } from '@/lib/types/result.type';
import { ok, fail } from '@/lib/types/result.type';
import type { ParticipantId, CampaignId } from '@/lib/types/branded.type';
import { Email } from '@/core/value-objects/email.vo';
import type { Participant } from '@/generated/prisma';

/**
 * Prisma Participant Repository Implementation
 */
export class PrismaParticipantRepository implements IParticipantRepository {
  async findById(id: ParticipantId): Promise<ParticipantData | null> {
    const participant = await prisma.participant.findUnique({
      where: { id: id as string },
    });

    if (!participant) {
      return null;
    }

    return this.mapToParticipantData(participant);
  }

  async findByEmailAndCampaign(
    email: Email,
    campaignId: CampaignId,
  ): Promise<ParticipantData | null> {
    const participant = await prisma.participant.findFirst({
      where: {
        email: email.getValue(),
        campaignId: campaignId as string,
      },
    });

    if (!participant) {
      return null;
    }

    return this.mapToParticipantData(participant);
  }

  async findByEmailAndCampaignWithConditions(
    email: string,
    campaignId: string,
  ): Promise<ParticipantWithConditions | null> {
    const participant = await prisma.participant.findFirst({
      where: {
        email,
        campaignId,
      },
    });

    if (!participant) {
      return null;
    }

    return {
      id: participant.id,
      campaignId: participant.campaignId,
      email: participant.email,
      name: participant.name || '',
      hasPlayed: participant.hasPlayed,
      playCount: participant.playCount,
      playedAt: participant.playedAt,
      completedConditions: (participant.completedConditions as string[]) || [],
      playedConditions: (participant.playedConditions as string[]) || [],
      currentConditionOrder: participant.currentConditionOrder,
    };
  }

  async getStorePlayedGameTypes(email: string, storeId: string): Promise<StorePlayedGameRecord[]> {
    const result = await prisma.$queryRaw<Array<{ condition_type: string }>>`
      SELECT condition_type
      FROM store_played_games
      WHERE email = ${email}
        AND store_id = ${storeId}
    `;

    return result.map((row) => ({ conditionType: row.condition_type }));
  }

  async upsert(input: UpsertParticipantInput): Promise<Participant> {
    return prisma.participant.upsert({
      where: {
        email_campaignId: {
          email: input.email,
          campaignId: input.campaignId,
        },
      },
      create: {
        campaignId: input.createData.campaignId,
        email: input.createData.email,
        name: input.createData.name,
        hasPlayed: input.createData.hasPlayed ?? false,
        playCount: input.createData.playCount ?? 0,
        completedConditions: input.createData.completedConditions ?? [],
        playedConditions: input.createData.playedConditions ?? [],
        currentConditionOrder: input.createData.currentConditionOrder ?? undefined,
      },
      update: {
        ...(input.updateData.hasPlayed !== undefined && {
          hasPlayed: input.updateData.hasPlayed,
        }),
        ...(input.updateData.playCount !== undefined && {
          playCount: { increment: input.updateData.playCount },
        }),
        ...(input.updateData.playedAt !== undefined && {
          playedAt: input.updateData.playedAt,
        }),
        ...(input.updateData.playedConditions !== undefined && {
          playedConditions: input.updateData.playedConditions,
        }),
        ...(input.updateData.completedConditions !== undefined && {
          completedConditions: input.updateData.completedConditions,
        }),
        ...(input.updateData.currentConditionOrder !== undefined && {
          currentConditionOrder: input.updateData.currentConditionOrder,
        }),
      },
    });
  }

  async recordStorePlayedGame(
    email: string,
    storeId: string,
    conditionType: string,
    campaignId: string,
  ): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO store_played_games (id, email, store_id, condition_type, campaign_id, played_at)
      VALUES (gen_random_uuid()::text, ${email}, ${storeId}, ${conditionType}::"ConditionType", ${campaignId}, NOW())
      ON CONFLICT (email, store_id, condition_type)
      DO UPDATE SET played_at = NOW(), campaign_id = ${campaignId}
    `;
  }

  async findByCampaign(
    campaignId: CampaignId,
    options?: {
      limit?: number;
      offset?: number;
      hasPlayed?: boolean;
      hasReviewed?: boolean;
    },
  ): Promise<ParticipantData[]> {
    const participants = await prisma.participant.findMany({
      where: {
        campaignId: campaignId as string,
        ...(options?.hasPlayed !== undefined && { hasPlayed: options.hasPlayed }),
        ...(options?.hasReviewed !== undefined && { hasReviewed: options.hasReviewed }),
      },
      take: options?.limit,
      skip: options?.offset,
    });

    return participants.map((p) => this.mapToParticipantData(p));
  }

  async create(data: CreateParticipantData): Promise<Result<ParticipantData>> {
    try {
      const participant = await prisma.participant.create({
        data: {
          email: data.email.getValue(),
          name: data.name ?? null,
          phone: data.phone ?? null,
          campaignId: data.campaignId as string,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
          hasPlayed: false,
          playCount: 0,
        },
      });

      return ok(this.mapToParticipantData(participant));
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to create participant'));
    }
  }

  async markAsPlayed(id: ParticipantId, playedAt: Date): Promise<Result<void>> {
    try {
      await prisma.participant.update({
        where: { id: id as string },
        data: {
          hasPlayed: true,
          playCount: { increment: 1 },
          playedAt,
        },
      });

      return ok(undefined);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to mark as played'));
    }
  }

  async saveReview(
    id: ParticipantId,
    rating: number,
    comment: string | null,
  ): Promise<Result<void>> {
    try {
      await prisma.participant.update({
        where: { id: id as string },
        data: {
          hasReviewed: true,
          reviewRating: rating,
          reviewComment: comment,
        },
      });

      return ok(undefined);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to save review'));
    }
  }

  async hasParticipated(email: Email, campaignId: CampaignId): Promise<boolean> {
    const count = await prisma.participant.count({
      where: {
        email: email.getValue(),
        campaignId: campaignId as string,
      },
    });

    return count > 0;
  }

  async countByCampaign(campaignId: CampaignId): Promise<number> {
    return prisma.participant.count({
      where: { campaignId: campaignId as string },
    });
  }

  async countPlayedByCampaign(campaignId: CampaignId): Promise<number> {
    return prisma.participant.count({
      where: {
        campaignId: campaignId as string,
        hasPlayed: true,
      },
    });
  }

  async countReviewedByCampaign(campaignId: CampaignId): Promise<number> {
    return prisma.participant.count({
      where: {
        campaignId: campaignId as string,
        hasReviewed: true,
      },
    });
  }

  async getParticipantStats(campaignId: CampaignId): Promise<{
    total: number;
    played: number;
    reviewed: number;
    conversionRate: number;
    averageRating: number;
  }> {
    const [total, played, reviewed, avgRating] = await Promise.all([
      this.countByCampaign(campaignId),
      this.countPlayedByCampaign(campaignId),
      this.countReviewedByCampaign(campaignId),
      prisma.participant.aggregate({
        where: {
          campaignId: campaignId as string,
          hasReviewed: true,
        },
        _avg: {
          reviewRating: true,
        },
      }),
    ]);

    const conversionRate = total > 0 ? (reviewed / total) * 100 : 0;
    const averageRating = avgRating._avg.reviewRating ?? 0;

    return {
      total,
      played,
      reviewed,
      conversionRate,
      averageRating,
    };
  }

  async anonymize(id: ParticipantId): Promise<Result<void>> {
    try {
      await prisma.participant.update({
        where: { id: id as string },
        data: {
          email: `anonymized-${id}@deleted.com`,
          name: 'Anonymized',
          phone: null,
          ipAddress: null,
          userAgent: null,
          reviewComment: null,
        },
      });

      return ok(undefined);
    } catch (error) {
      return fail(error instanceof Error ? error : new Error('Failed to anonymize participant'));
    }
  }

  async exportByCampaign(campaignId: CampaignId): Promise<ParticipantData[]> {
    const participants = await prisma.participant.findMany({
      where: { campaignId: campaignId as string },
      orderBy: { createdAt: 'desc' },
    });

    return participants.map((p) => this.mapToParticipantData(p));
  }

  /**
   * Maps Prisma Participant to ParticipantData
   */
  private mapToParticipantData(participant: Participant): ParticipantData {
    const emailResult = Email.create(participant.email);
    if (!emailResult.success) {
      throw new Error(`Invalid email in database: ${participant.email}`);
    }

    return {
      id: participant.id as ParticipantId,
      email: emailResult.data,
      name: participant.name,
      phone: participant.phone,
      campaignId: participant.campaignId as CampaignId,
      hasPlayed: participant.hasPlayed,
      playedAt: participant.playedAt,
      ipAddress: participant.ipAddress,
      userAgent: participant.userAgent,
      hasReviewed: participant.hasReviewed,
      reviewRating: participant.reviewRating,
      reviewComment: participant.reviewComment,
      createdAt: participant.createdAt,
    };
  }
}
