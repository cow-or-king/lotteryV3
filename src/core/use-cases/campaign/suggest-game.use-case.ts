/**
 * Suggest Game Use Case
 * Suggère intelligemment un type de jeu basé sur le nombre de lots
 * IMPORTANT: ZERO any types
 */

import { Result } from '@/core/result';
import {
  GameSuggestion,
  type GameSuggestionResult,
} from '@/core/value-objects/game-suggestion.value-object';

export interface SuggestGameDTO {
  numberOfPrizes: number;
}

export class SuggestGameUseCase {
  async execute(dto: SuggestGameDTO): Promise<Result<GameSuggestionResult>> {
    const suggestionResult = GameSuggestion.suggest(dto.numberOfPrizes);

    if (!suggestionResult.success) {
      return Result.fail(suggestionResult.error);
    }

    return Result.ok(suggestionResult.data.getSuggestion());
  }
}
