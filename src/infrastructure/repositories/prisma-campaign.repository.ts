/**
 * Prisma Campaign Repository
 * Implémente l'interface Campaign Repository avec Prisma
 * IMPORTANT: ZERO any types
 */

import { prisma } from '@/infrastructure/database/prisma-client';
import type { CampaignRepository } from '@/core/use-cases/campaign/create-campaign.use-case';
import type { PrizeConfig } from '@/core/value-objects/prize-configuration.value-object';

export class PrismaCampaignRepository implements CampaignRepository {
  async createWithPrizes(data: {
    campaign: {
      name: string;
      description?: string;
      storeId: string;
      gameId?: string;
      maxParticipants?: number;
      prizeClaimExpiryDays: number;
      requireReview: boolean;
      requireInstagram: boolean;
      isActive: boolean;
    };
    prizes: PrizeConfig[];
  }): Promise<{ id: string }> {
    // Utiliser des dates par défaut (aujourd'hui) pour startDate et endDate
    // car elles sont toujours requises dans la DB mais plus utilisées dans l'application
    const now = new Date();

    // Créer la campagne avec les prizes en une transaction
    const campaign = await prisma.campaign.create({
      data: {
        name: data.campaign.name,
        description: data.campaign.description,
        storeId: data.campaign.storeId,
        startDate: now,
        endDate: now,
        gameId: data.campaign.gameId,
        maxParticipants: data.campaign.maxParticipants,
        prizeClaimExpiryDays: data.campaign.prizeClaimExpiryDays,
        requireReview: data.campaign.requireReview,
        requireInstagram: data.campaign.requireInstagram,
        isActive: data.campaign.isActive,
        // Créer les prizes en même temps
        prizes: {
          create: data.prizes.map((prize) => ({
            name: prize.name,
            description: prize.description,
            value: prize.value,
            color: prize.color,
            probability: prize.probability,
            quantity: prize.quantity,
            remaining: prize.quantity, // Au début, remaining = quantity
          })),
        },
      },
      select: {
        id: true,
      },
    });

    return campaign;
  }

  async activateCampaign(campaignId: string): Promise<void> {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { isActive: true },
    });
  }

  async deactivateCampaign(campaignId: string): Promise<void> {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { isActive: false },
    });
  }

  async deactivateOtherCampaigns(storeId: string, exceptCampaignId: string): Promise<void> {
    await prisma.campaign.updateMany({
      where: {
        storeId,
        id: { not: exceptCampaignId },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
  }

  async getById(id: string): Promise<{
    id: string;
    name: string;
    description: string | null;
    storeId: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    gameId: string | null;
    maxParticipants: number | null;
    prizeClaimExpiryDays: number;
    requireReview: boolean;
    requireInstagram: boolean;
    prizes: Array<{
      id: string;
      name: string;
      description: string | null;
      color: string;
      probability: number;
      quantity: number;
      remaining: number;
      value: number | null;
    }>;
    _count: {
      participants: number;
      prizes: number;
    };
  } | null> {
    return await prisma.campaign.findUnique({
      where: { id },
      include: {
        prizes: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
            probability: true,
            quantity: true,
            remaining: true,
            value: true,
          },
        },
        _count: {
          select: {
            participants: true,
            prizes: true,
          },
        },
      },
    });
  }

  async listByStore(storeId: string): Promise<
    Array<{
      id: string;
      name: string;
      description: string | null;
      startDate: Date;
      endDate: Date;
      isActive: boolean;
      gameId: string | null;
      maxParticipants: number | null;
      _count: {
        participants: number;
        prizes: number;
      };
    }>
  > {
    return await prisma.campaign.findMany({
      where: { storeId },
      include: {
        _count: {
          select: {
            participants: true,
            prizes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async listAll(storeIds: string[]): Promise<
    Array<{
      id: string;
      name: string;
      description: string | null;
      startDate: Date;
      endDate: Date;
      isActive: boolean;
      gameId: string | null;
      maxParticipants: number | null;
      storeId: string;
      _count: {
        participants: number;
        prizes: number;
      };
    }>
  > {
    return await prisma.campaign.findMany({
      where: {
        storeId: {
          in: storeIds,
        },
      },
      include: {
        _count: {
          select: {
            participants: true,
            prizes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async delete(id: string): Promise<void> {
    // Prisma cascade delete handle les prizes automatiquement
    await prisma.campaign.delete({
      where: { id },
    });
  }
}
