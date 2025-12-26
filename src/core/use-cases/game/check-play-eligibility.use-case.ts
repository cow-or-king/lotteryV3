/**
 * Check Play Eligibility Use Case
 * Vérifie si un joueur peut participer au jeu (délais, conditions, etc.)
 * IMPORTANT: ZERO any types, Result Pattern
 */

import { Result } from '@/lib/types/result.type';
import { prisma } from '@/infrastructure/database/prisma-client';
import type { CampaignForPlay } from './validate-campaign-for-play.use-case';

export interface CheckPlayEligibilityInput {
  campaign: CampaignForPlay;
  playerEmail: string;
}

export interface CheckPlayEligibilityOutput {
  canPlay: boolean;
  nextPlayableConditionId: string | null;
  playableConditionType: string | null;
}

// Module-level eligibility helper functions
function calculateDaysSinceLastPlay(lastPlayDate: Date): number {
  return Math.floor((Date.now() - lastPlayDate.getTime()) / (1000 * 60 * 60 * 24));
}

function hasReachedMinDaysBetweenPlays(
  lastPlayDate: Date | null,
  minDays: number | null,
): { valid: boolean; daysRemaining?: number } {
  if (!minDays || !lastPlayDate) {
    return { valid: true };
  }

  const daysSinceLastPlay = calculateDaysSinceLastPlay(lastPlayDate);
  if (daysSinceLastPlay >= minDays) {
    return { valid: true };
  }

  return {
    valid: false,
    daysRemaining: minDays - daysSinceLastPlay,
  };
}

async function hasReachedMaxParticipants(
  campaignId: string,
  maxParticipants: number | null,
): Promise<boolean> {
  if (!maxParticipants) {
    return false;
  }

  const participantCount = await prisma.participant.count({
    where: { campaignId },
  });

  return participantCount >= maxParticipants;
}

function getCompletedGameEnabledConditions(
  completedConditions: string[],
  campaignConditions: CampaignForPlay['conditions'],
): string[] {
  return completedConditions.filter((condId) => {
    const cond = campaignConditions.find((c) => c.id === condId);
    return cond?.enablesGame === true;
  });
}

function isConditionPlayable(
  conditionId: string,
  playedConditions: string[],
  campaignConditions: CampaignForPlay['conditions'],
  storePlayedTypes: Set<string>,
): boolean {
  if (playedConditions.includes(conditionId)) {
    return false;
  }

  const condition = campaignConditions.find((c) => c.id === conditionId);
  if (!condition) {
    return false;
  }

  return !storePlayedTypes.has(condition.type);
}

function getPlayableConditions(
  completedGameEnabledConditions: string[],
  playedConditions: string[],
  campaignConditions: CampaignForPlay['conditions'],
  storePlayedTypes: Set<string>,
): string[] {
  return completedGameEnabledConditions.filter((condId) =>
    isConditionPlayable(condId, playedConditions, campaignConditions, storePlayedTypes),
  );
}

export class CheckPlayEligibilityUseCase {
  async execute(input: CheckPlayEligibilityInput): Promise<Result<CheckPlayEligibilityOutput>> {
    const { campaign, playerEmail } = input;

    const existingParticipation = await prisma.participant.findFirst({
      where: {
        campaignId: campaign.id,
        email: playerEmail,
      },
    });

    // Early return: Check minimum days between plays
    const daysCheck = hasReachedMinDaysBetweenPlays(
      existingParticipation?.playedAt ?? null,
      campaign.minDaysBetweenPlays,
    );
    if (!daysCheck.valid && daysCheck.daysRemaining !== undefined) {
      return Result.fail(
        new Error(
          `Vous devez attendre encore ${daysCheck.daysRemaining} jour${daysCheck.daysRemaining > 1 ? 's' : ''} avant de pouvoir rejouer.`,
        ),
      );
    }

    // Early return: Check max participants
    if (await hasReachedMaxParticipants(campaign.id, campaign.maxParticipants)) {
      return Result.fail(new Error('Le nombre maximum de participants a été atteint'));
    }

    // Handle campaigns with conditions
    if (campaign.conditions.length > 0) {
      return this.checkConditionBasedEligibility(campaign, playerEmail, existingParticipation);
    }

    // Early return: No conditions but already played
    if (existingParticipation?.hasPlayed) {
      return Result.fail(new Error('Vous avez déjà participé à cette campagne'));
    }

    return Result.ok({
      canPlay: true,
      nextPlayableConditionId: null,
      playableConditionType: null,
    });
  }

  private async checkConditionBasedEligibility(
    campaign: CampaignForPlay,
    playerEmail: string,
    existingParticipation: Awaited<ReturnType<typeof prisma.participant.findFirst>>,
  ): Promise<Result<CheckPlayEligibilityOutput>> {
    // Early return: No participant record
    if (!existingParticipation) {
      return Result.fail(new Error('Vous devez compléter au moins une condition avant de jouer'));
    }

    const completedConditions = (existingParticipation.completedConditions as string[]) || [];
    const playedConditions = (existingParticipation.playedConditions as string[]) || [];

    // Get store-level played game types
    const storePlayedGames = await prisma.$queryRaw<Array<{ condition_type: string }>>`
      SELECT condition_type
      FROM store_played_games
      WHERE email = ${playerEmail}
        AND store_id = ${campaign.storeId}
    `;
    const storePlayedTypes = new Set(storePlayedGames.map((g) => g.condition_type));

    const completedGameEnabledConditions = getCompletedGameEnabledConditions(
      completedConditions,
      campaign.conditions,
    );

    const playableConditions = getPlayableConditions(
      completedGameEnabledConditions,
      playedConditions,
      campaign.conditions,
      storePlayedTypes,
    );

    // Early return: No playable conditions
    if (playableConditions.length === 0) {
      return Result.fail(
        new Error(
          'Vous avez déjà joué pour toutes les conditions complétées. Complétez la prochaine condition pour rejouer.',
        ),
      );
    }

    const nextPlayableConditionId = playableConditions[0] || null;
    const playableCondition = campaign.conditions.find((c) => c.id === nextPlayableConditionId);
    const playableConditionType = playableCondition?.type || null;

    return Result.ok({
      canPlay: true,
      nextPlayableConditionId,
      playableConditionType,
    });
  }
}
