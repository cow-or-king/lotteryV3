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

export class CheckPlayEligibilityUseCase {
  async execute(input: CheckPlayEligibilityInput): Promise<Result<CheckPlayEligibilityOutput>> {
    const { campaign, playerEmail } = input;

    // Vérifier si l'utilisateur peut jouer (nouveau système playCount)
    const existingParticipation = await prisma.participant.findFirst({
      where: {
        campaignId: campaign.id,
        email: playerEmail,
      },
    });

    // Vérifier le délai minimum entre 2 jeux
    if (campaign.minDaysBetweenPlays && existingParticipation?.playedAt) {
      const daysSinceLastPlay = Math.floor(
        (Date.now() - existingParticipation.playedAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceLastPlay < campaign.minDaysBetweenPlays) {
        const daysRemaining = campaign.minDaysBetweenPlays - daysSinceLastPlay;
        return Result.fail(
          new Error(
            `Vous devez attendre encore ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} avant de pouvoir rejouer.`,
          ),
        );
      }
    }

    // Vérifier le nombre max de participants
    if (campaign.maxParticipants) {
      const participantCount = await prisma.participant.count({
        where: { campaignId: campaign.id },
      });

      if (participantCount >= campaign.maxParticipants) {
        return Result.fail(new Error('Le nombre maximum de participants a été atteint'));
      }
    }

    // NOUVEAU SYSTÈME: Tracking par condition avec playedConditions
    let nextPlayableConditionId: string | null = null;
    let playableConditionType: string | null = null;

    if (campaign.conditions.length > 0) {
      const participant = existingParticipation;

      if (!participant) {
        return Result.fail(new Error('Vous devez compléter au moins une condition avant de jouer'));
      }

      const completedConditions = (participant.completedConditions as string[]) || [];
      const playedConditions = (participant.playedConditions as string[]) || [];

      // Récupérer les types de conditions pour lesquelles un jeu a déjà été joué au niveau STORE
      const storePlayedGames = await prisma.$queryRaw<Array<{ condition_type: string }>>`
        SELECT condition_type
        FROM store_played_games
        WHERE email = ${playerEmail}
          AND store_id = ${campaign.storeId}
      `;
      const storePlayedTypes = new Set(storePlayedGames.map((g) => g.condition_type));

      // Trouver les conditions complétées qui donnent accès au jeu
      const completedGameEnabledConditions = completedConditions.filter((condId) => {
        const cond = campaign.conditions.find((c) => c.id === condId);
        return cond?.enablesGame === true;
      });

      // Filtrer les conditions pour lesquelles on peut jouer
      const playableConditions = completedGameEnabledConditions.filter((condId) => {
        if (playedConditions.includes(condId)) {
          return false;
        }

        const condition = campaign.conditions.find((c) => c.id === condId);
        if (!condition) {
          return false;
        }

        return !storePlayedTypes.has(condition.type);
      });

      // Vérifier si l'utilisateur peut jouer
      if (playableConditions.length === 0) {
        return Result.fail(
          new Error(
            'Vous avez déjà joué pour toutes les conditions complétées. Complétez la prochaine condition pour rejouer.',
          ),
        );
      }

      // Prendre la première condition pour laquelle on peut jouer
      nextPlayableConditionId = playableConditions[0] || null;
      const playableCondition = campaign.conditions.find((c) => c.id === nextPlayableConditionId);
      playableConditionType = playableCondition?.type || null;
    } else {
      // Pas de conditions, vérifier simplement si déjà joué
      if (existingParticipation && existingParticipation.hasPlayed) {
        return Result.fail(new Error('Vous avez déjà participé à cette campagne'));
      }
    }

    return Result.ok({
      canPlay: true,
      nextPlayableConditionId,
      playableConditionType,
    });
  }
}
