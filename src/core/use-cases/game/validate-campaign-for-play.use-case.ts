/**
 * Validate Campaign For Play Use Case
 * Vérifie qu'une campagne existe et est active pour le jeu
 * IMPORTANT: ZERO any types, Result Pattern
 */

import { Result } from '@/lib/types/result.type';
import { prisma } from '@/infrastructure/database/prisma-client';
import type { Campaign, Game, Prize } from '@/generated/prisma';

// Define Condition type locally since it's not exported from Prisma
type Condition = {
  id: string;
  type: string;
  order: number;
  title: string;
  description: string | null;
  redirectUrl: string | null;
  iconEmoji: string | null;
  config: unknown;
  isRequired: boolean;
  enablesGame: boolean;
  createdAt: Date;
  updatedAt: Date;
  campaignId: string;
};

export type CampaignForPlay = Campaign & {
  game: Game | null;
  prizes: Prize[];
  conditions: Condition[];
};

export interface ValidateCampaignForPlayInput {
  campaignId: string;
}

export interface ValidateCampaignForPlayOutput {
  campaign: CampaignForPlay;
}

export class ValidateCampaignForPlayUseCase {
  async execute(
    input: ValidateCampaignForPlayInput,
  ): Promise<Result<ValidateCampaignForPlayOutput>> {
    // Charger la campagne avec ses relations
    const campaign = await prisma.campaign.findUnique({
      where: { id: input.campaignId },
      include: {
        game: true,
        prizes: {
          where: {
            remaining: {
              gt: 0,
            },
          },
        },
        conditions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!campaign) {
      return Result.fail(new Error('Campagne introuvable'));
    }

    if (!campaign.isActive) {
      return Result.fail(new Error('Cette campagne n est pas active'));
    }

    return Result.ok({ campaign });
  }
}
