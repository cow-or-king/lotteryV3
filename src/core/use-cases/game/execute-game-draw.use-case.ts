/**
 * Execute Game Draw Use Case
 * Effectue le tirage au sort et met à jour le participant
 * IMPORTANT: ZERO any types, Result Pattern
 */

import { Result } from '@/lib/types/result.type';
import { prisma } from '@/infrastructure/database/prisma-client';
import { generateClaimCode, selectPrize } from '@/server/api/routers/game/game-utils';
import type { CampaignForPlay } from './validate-campaign-for-play.use-case';
import type { Participant } from '@/generated/prisma';

export interface ExecuteGameDrawInput {
  campaign: CampaignForPlay;
  playerEmail: string;
  playerName: string;
  nextPlayableConditionId: string | null;
  playableConditionType: string | null;
}

export interface ExecuteGameDrawOutput {
  participant: Participant;
  wonPrizeId: string | null;
  wonPrizeName: string | null;
  wonPrizeDescription: string | null;
  wonPrizeValue: number | null;
  wonPrizeColor: string | null;
  claimCode: string | null;
}

export class ExecuteGameDrawUseCase {
  async execute(input: ExecuteGameDrawInput): Promise<Result<ExecuteGameDrawOutput>> {
    const { campaign, playerEmail, playerName, nextPlayableConditionId, playableConditionType } =
      input;

    // Effectuer le tirage au sort
    const wonPrize = selectPrize(campaign.prizes);

    // Récupérer la participation existante pour les playedConditions
    const existingParticipation = await prisma.participant.findFirst({
      where: {
        campaignId: campaign.id,
        email: playerEmail,
      },
    });

    // Préparer les playedConditions à mettre à jour
    const existingPlayedConditions = (existingParticipation?.playedConditions as string[]) || [];
    const updatedPlayedConditions = nextPlayableConditionId
      ? [...existingPlayedConditions, nextPlayableConditionId]
      : existingPlayedConditions;

    // Créer ou mettre à jour le participant
    const participant = await prisma.participant.upsert({
      where: {
        email_campaignId: {
          email: playerEmail,
          campaignId: campaign.id,
        },
      },
      create: {
        campaignId: campaign.id,
        email: playerEmail,
        name: playerName,
        hasPlayed: true,
        playCount: 1,
        playedAt: new Date(),
        completedConditions: [],
        playedConditions: nextPlayableConditionId ? [nextPlayableConditionId] : [],
        currentConditionOrder: campaign.conditions.length,
      },
      update: {
        hasPlayed: true,
        playCount: {
          increment: 1,
        },
        playedAt: new Date(),
        playedConditions: updatedPlayedConditions,
      },
    });

    // NOUVEAU: Enregistrer au niveau STORE qu'un jeu a été joué pour ce TYPE de condition
    if (playableConditionType) {
      await prisma.$executeRaw`
        INSERT INTO store_played_games (id, email, store_id, condition_type, campaign_id, played_at)
        VALUES (gen_random_uuid()::text, ${playerEmail}, ${campaign.storeId}, ${playableConditionType}::"ConditionType", ${campaign.id}, NOW())
        ON CONFLICT (email, store_id, condition_type)
        DO UPDATE SET played_at = NOW(), campaign_id = ${campaign.id}
      `;
    }

    // Générer le code de réclamation si un lot a été gagné
    let claimCode: string | null = null;

    if (wonPrize) {
      claimCode = generateClaimCode();

      // Calculer la date d'expiration
      const expiryDays = campaign.prizeClaimExpiryDays || 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      // Créer une entrée Winner
      await prisma.winner.create({
        data: {
          prizeId: wonPrize.id,
          participantEmail: playerEmail,
          participantName: playerName,
          claimCode,
          expiresAt,
          status: 'PENDING',
        },
      });

      // Décrémenter la quantité restante
      await prisma.prize.update({
        where: { id: wonPrize.id },
        data: {
          remaining: {
            decrement: 1,
          },
        },
      });
    }

    return Result.ok({
      participant,
      wonPrizeId: wonPrize?.id || null,
      wonPrizeName: wonPrize?.name || null,
      wonPrizeDescription: wonPrize?.description || null,
      wonPrizeValue: wonPrize?.value || null,
      wonPrizeColor: wonPrize?.color || null,
      claimCode,
    });
  }
}
