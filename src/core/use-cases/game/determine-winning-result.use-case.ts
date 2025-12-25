/**
 * Determine Winning Result Use Case
 * Détermine le segment/combinaison gagnant pour l'animation du jeu
 * IMPORTANT: ZERO any types, Result Pattern
 */

import { Result } from '@/lib/types/result.type';
import type { CampaignForPlay } from './validate-campaign-for-play.use-case';

export interface DetermineWinningResultInput {
  campaign: CampaignForPlay;
  wonPrizeId: string | null;
}

export interface DetermineWinningResultOutput {
  winningSegmentId: string | null;
  winningCombination: [string, string, string] | null;
}

export class DetermineWinningResultUseCase {
  execute(input: DetermineWinningResultInput): Result<DetermineWinningResultOutput> {
    const { campaign, wonPrizeId } = input;

    let winningSegmentId: string | null = null;
    let winningCombination: [string, string, string] | null = null;

    if (!wonPrizeId || !campaign.game?.config || !campaign.prizes) {
      return Result.ok({ winningSegmentId, winningCombination });
    }

    const gameConfig = campaign.game.config as {
      segments?: Array<{ id: string; label: string; prize?: { prizeIndex: number } }>;
      winningPatterns?: Array<{ symbols: [string, string, string]; prizeIndex: number }>;
    };

    // Pour la roue (WHEEL ou WHEEL_MINI)
    if (campaign.game.type === 'WHEEL' || campaign.game.type === 'WHEEL_MINI') {
      if (gameConfig.segments) {
        // Trouver l'INDEX du prize gagné dans la liste des prizes
        const prizeIndex = campaign.prizes.findIndex((p) => p.id === wonPrizeId);

        // Utiliser cet index pour trouver le segment correspondant
        if (prizeIndex !== -1 && prizeIndex < gameConfig.segments.length) {
          const segment = gameConfig.segments[prizeIndex];
          if (segment) {
            winningSegmentId = segment.id;
          }
        }
      }
    }

    // Pour la slot machine
    if (campaign.game.type === 'SLOT_MACHINE') {
      if (gameConfig.winningPatterns && gameConfig.winningPatterns.length > 0) {
        // Trouver l'INDEX du prize gagné
        const prizeIndex = campaign.prizes.findIndex((p) => p.id === wonPrizeId);

        // Trouver tous les patterns pour ce prize
        const matchingPatterns = gameConfig.winningPatterns.filter(
          (pattern) => pattern.prizeIndex === prizeIndex,
        );

        if (matchingPatterns.length > 0) {
          // Choisir un pattern aléatoire
          const randomPattern =
            matchingPatterns[Math.floor(Math.random() * matchingPatterns.length)];
          if (randomPattern) {
            winningCombination = randomPattern.symbols;
          }
        }
      }
    }

    return Result.ok({ winningSegmentId, winningCombination });
  }
}
