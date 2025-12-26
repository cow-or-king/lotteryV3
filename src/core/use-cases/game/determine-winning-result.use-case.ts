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

type GameConfig = {
  segments?: Array<{ id: string; label: string; prize?: { prizeIndex: number } }>;
  winningPatterns?: Array<{ symbols: [string, string, string]; prizeIndex: number }>;
};

type Prize = { id: string };

// Module-level helpers
function findPrizeIndex(prizes: Prize[], wonPrizeId: string): number {
  return prizes.findIndex((p) => p.id === wonPrizeId);
}

function getWinningSegmentId(gameConfig: GameConfig, prizeIndex: number): string | null {
  if (!gameConfig.segments) return null;

  if (prizeIndex !== -1 && prizeIndex < gameConfig.segments.length) {
    const segment = gameConfig.segments[prizeIndex];
    return segment?.id ?? null;
  }

  return null;
}

function getRandomPattern<T>(patterns: T[]): T | undefined {
  return patterns[Math.floor(Math.random() * patterns.length)];
}

function getWinningCombination(
  gameConfig: GameConfig,
  prizeIndex: number,
): [string, string, string] | null {
  if (!gameConfig.winningPatterns || gameConfig.winningPatterns.length === 0) {
    return null;
  }

  const matchingPatterns = gameConfig.winningPatterns.filter(
    (pattern) => pattern.prizeIndex === prizeIndex,
  );

  if (matchingPatterns.length === 0) return null;

  const randomPattern = getRandomPattern(matchingPatterns);
  return randomPattern?.symbols ?? null;
}

function isWheelGame(gameType: string): boolean {
  return gameType === 'WHEEL' || gameType === 'WHEEL_MINI';
}

export class DetermineWinningResultUseCase {
  execute(input: DetermineWinningResultInput): Result<DetermineWinningResultOutput> {
    const { campaign, wonPrizeId } = input;

    let winningSegmentId: string | null = null;
    let winningCombination: [string, string, string] | null = null;

    if (!wonPrizeId || !campaign.game?.config || !campaign.prizes) {
      return Result.ok({ winningSegmentId, winningCombination });
    }

    const gameConfig = campaign.game.config as GameConfig;
    const prizeIndex = findPrizeIndex(campaign.prizes, wonPrizeId);

    // Pour la roue (WHEEL ou WHEEL_MINI)
    if (isWheelGame(campaign.game.type)) {
      winningSegmentId = getWinningSegmentId(gameConfig, prizeIndex);
    }

    // Pour la slot machine
    if (campaign.game.type === 'SLOT_MACHINE') {
      winningCombination = getWinningCombination(gameConfig, prizeIndex);
    }

    return Result.ok({ winningSegmentId, winningCombination });
  }
}
