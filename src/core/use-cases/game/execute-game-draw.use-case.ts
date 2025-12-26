/**
 * Execute Game Draw Use Case
 * Effectue le tirage au sort et met à jour le participant
 * IMPORTANT: ZERO any types, Result Pattern
 * Architecture Hexagonale: Use Case ne dépend PAS de l'infrastructure
 */

import { Result } from '@/lib/types/result.type';
import { generateClaimCode, selectPrize } from '@/server/api/routers/game/game-utils';
import type { CampaignForPlay } from './validate-campaign-for-play.use-case';
import type { Participant } from '@/generated/prisma';
import type { IParticipantRepository } from '@/core/repositories/participant.repository.interface';

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

interface Prize {
  id: string;
  name: string;
  description: string | null;
  value: number | null;
  color: string;
}

/**
 * Repository interfaces pour les dépendances (injection)
 */
interface WinnerRepository {
  create(data: {
    prizeId: string;
    participantEmail: string;
    participantName: string;
    claimCode: string;
    expiresAt: Date;
    status: string;
  }): Promise<void>;
}

interface PrizeRepository {
  decrementRemaining(prizeId: string): Promise<void>;
}

// Module-level helpers
function preparePlayedConditions(
  existingConditions: string[],
  nextConditionId: string | null,
): string[] {
  return nextConditionId ? [...existingConditions, nextConditionId] : existingConditions;
}

function calculateExpiryDate(expiryDays: number): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);
  return expiresAt;
}

function buildDrawOutput(
  participant: Participant,
  wonPrize: Prize | null,
  claimCode: string | null,
): ExecuteGameDrawOutput {
  return {
    participant,
    wonPrizeId: wonPrize?.id || null,
    wonPrizeName: wonPrize?.name || null,
    wonPrizeDescription: wonPrize?.description || null,
    wonPrizeValue: wonPrize?.value || null,
    wonPrizeColor: wonPrize?.color || null,
    claimCode,
  };
}

export class ExecuteGameDrawUseCase {
  constructor(
    private participantRepo: IParticipantRepository,
    private winnerRepo: WinnerRepository,
    private prizeRepo: PrizeRepository,
  ) {}

  async execute(input: ExecuteGameDrawInput): Promise<Result<ExecuteGameDrawOutput>> {
    const { campaign, playerEmail, playerName, nextPlayableConditionId, playableConditionType } =
      input;

    // Effectuer le tirage au sort
    const wonPrize = selectPrize(campaign.prizes);

    // Créer ou mettre à jour le participant
    const participant = await this.upsertParticipant(
      campaign,
      playerEmail,
      playerName,
      nextPlayableConditionId,
    );

    // Enregistrer au niveau STORE
    await this.recordStorePlayedGame(
      playableConditionType,
      playerEmail,
      campaign.storeId,
      campaign.id,
    );

    // Traiter le lot gagné
    const claimCode = await this.processPrizeWin(wonPrize, playerEmail, playerName, campaign);

    return Result.ok(buildDrawOutput(participant, wonPrize, claimCode));
  }

  private async upsertParticipant(
    campaign: CampaignForPlay,
    playerEmail: string,
    playerName: string,
    nextPlayableConditionId: string | null,
  ): Promise<Participant> {
    // Récupérer la participation existante pour les playedConditions
    const existingParticipation = await this.participantRepo.findByEmailAndCampaignWithConditions(
      playerEmail,
      campaign.id,
    );

    // Préparer les playedConditions à mettre à jour
    const existingPlayedConditions = existingParticipation?.playedConditions || [];
    const updatedPlayedConditions = preparePlayedConditions(
      existingPlayedConditions,
      nextPlayableConditionId,
    );

    return this.participantRepo.upsert({
      email: playerEmail,
      campaignId: campaign.id,
      createData: {
        campaignId: campaign.id,
        email: playerEmail,
        name: playerName,
        hasPlayed: true,
        playCount: 1,
        completedConditions: [],
        playedConditions: nextPlayableConditionId ? [nextPlayableConditionId] : [],
        currentConditionOrder: campaign.conditions.length,
      },
      updateData: {
        hasPlayed: true,
        playCount: 1,
        playedAt: new Date(),
        playedConditions: updatedPlayedConditions,
      },
    });
  }

  private async recordStorePlayedGame(
    playableConditionType: string | null,
    playerEmail: string,
    storeId: string,
    campaignId: string,
  ): Promise<void> {
    if (!playableConditionType) {
      return;
    }

    await this.participantRepo.recordStorePlayedGame(
      playerEmail,
      storeId,
      playableConditionType,
      campaignId,
    );
  }

  private async processPrizeWin(
    wonPrize: Prize | null,
    playerEmail: string,
    playerName: string,
    campaign: CampaignForPlay,
  ): Promise<string | null> {
    if (!wonPrize) {
      return null;
    }

    const claimCode = generateClaimCode();
    const expiryDays = campaign.prizeClaimExpiryDays || 30;
    const expiresAt = calculateExpiryDate(expiryDays);

    // Créer une entrée Winner
    await this.winnerRepo.create({
      prizeId: wonPrize.id,
      participantEmail: playerEmail,
      participantName: playerName,
      claimCode,
      expiresAt,
      status: 'PENDING',
    });

    // Décrémenter la quantité restante
    await this.prizeRepo.decrementRemaining(wonPrize.id);

    return claimCode;
  }
}
