/**
 * Game Suggestion Value Object
 * Logique intelligente de suggestion de jeu selon le nombre de lots
 * IMPORTANT: ZERO any types
 */

import { Result } from '../result';

export type GameType =
  | 'WHEEL'
  | 'WHEEL_MINI'
  | 'SLOT_MACHINE'
  | 'MYSTERY_BOX'
  | 'SHAKE'
  | 'DICE'
  | 'SCRATCH'
  | 'MEMORY';

export interface GameSuggestionResult {
  primarySuggestion: GameType;
  alternativeSuggestions: GameType[];
  reason: string;
}

export class GameSuggestion {
  private constructor(private readonly suggestion: GameSuggestionResult) {}

  public static suggest(numberOfPrizes: number): Result<GameSuggestion> {
    // Validation
    if (numberOfPrizes < 1) {
      return Result.fail(new Error('Le nombre de lots doit être au moins 1'));
    }

    if (numberOfPrizes > 50) {
      return Result.fail(new Error('Le nombre de lots ne peut pas dépasser 50'));
    }

    const suggestion = this.calculateSuggestion(numberOfPrizes);

    return Result.ok(new GameSuggestion(suggestion));
  }

  private static calculateSuggestion(numberOfPrizes: number): GameSuggestionResult {
    // 1-6 lots : WHEEL_MINI (roue rapide) ou WHEEL classique
    if (numberOfPrizes >= 1 && numberOfPrizes <= 6) {
      return {
        primarySuggestion: 'WHEEL_MINI',
        alternativeSuggestions: ['WHEEL', 'MYSTERY_BOX', 'SHAKE'],
        reason: `Avec ${numberOfPrizes} lot${numberOfPrizes > 1 ? 's' : ''}, une roue rapide (1-6 segments) est idéale pour une expérience utilisateur simple et rapide.`,
      };
    }

    // 7-12 lots : WHEEL classique (optimal pour 8-12 segments)
    if (numberOfPrizes >= 7 && numberOfPrizes <= 12) {
      return {
        primarySuggestion: 'WHEEL',
        alternativeSuggestions: ['SLOT_MACHINE', 'MYSTERY_BOX'],
        reason: `Avec ${numberOfPrizes} lots, une roue classique (7-12 segments) offre un équilibre parfait entre variété et lisibilité.`,
      };
    }

    // 13-20 lots : SLOT_MACHINE (peut gérer plus de combinaisons)
    if (numberOfPrizes >= 13 && numberOfPrizes <= 20) {
      return {
        primarySuggestion: 'SLOT_MACHINE',
        alternativeSuggestions: ['WHEEL', 'SCRATCH', 'MEMORY'],
        reason: `Avec ${numberOfPrizes} lots, une machine à sous permet de gérer efficacement la variété de prix grâce à ses multiples rouleaux.`,
      };
    }

    // 21+ lots : SCRATCH ou MYSTERY_BOX (meilleurs pour beaucoup de lots)
    return {
      primarySuggestion: 'SCRATCH',
      alternativeSuggestions: ['MYSTERY_BOX', 'SLOT_MACHINE'],
      reason: `Avec ${numberOfPrizes} lots, un jeu de grattage ou une boîte mystère permet de gérer facilement une grande variété de prix sans surcharger l'interface.`,
    };
  }

  public getSuggestion(): GameSuggestionResult {
    return this.suggestion;
  }

  public getPrimarySuggestion(): GameType {
    return this.suggestion.primarySuggestion;
  }

  public getAlternatives(): GameType[] {
    return this.suggestion.alternativeSuggestions;
  }

  public getReason(): string {
    return this.suggestion.reason;
  }

  /**
   * Vérifie si un type de jeu est compatible avec le nombre de lots
   */
  public static isCompatible(gameType: GameType, numberOfPrizes: number): boolean {
    switch (gameType) {
      case 'WHEEL_MINI':
        return numberOfPrizes >= 1 && numberOfPrizes <= 6;

      case 'WHEEL':
        return numberOfPrizes >= 1 && numberOfPrizes <= 12;

      case 'SLOT_MACHINE':
        return numberOfPrizes >= 3 && numberOfPrizes <= 30;

      case 'SCRATCH':
      case 'MYSTERY_BOX':
        return numberOfPrizes >= 1 && numberOfPrizes <= 50;

      case 'SHAKE':
      case 'DICE':
        return numberOfPrizes >= 1 && numberOfPrizes <= 6;

      case 'MEMORY':
        return numberOfPrizes >= 4 && numberOfPrizes <= 20;

      default:
        return false;
    }
  }
}
