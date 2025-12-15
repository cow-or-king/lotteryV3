/**
 * Prize Configuration Value Object
 * Encapsulates prize configuration logic with validation
 * IMPORTANT: ZERO any types
 */

import { Result } from '../result';

export interface PrizeConfig {
  name: string;
  description?: string;
  quantity: number;
  probability: number;
  color: string;
  value?: number;
}

export class PrizeConfiguration {
  private constructor(private readonly prizes: PrizeConfig[]) {}

  public static create(prizes: PrizeConfig[]): Result<PrizeConfiguration> {
    // Validation: Au moins 1 lot
    if (prizes.length === 0) {
      return Result.fail(new Error('Au moins un lot est requis'));
    }

    // Validation: Maximum 50 lots
    if (prizes.length > 50) {
      return Result.fail(new Error('Maximum 50 lots autorisés'));
    }

    // Validation: Chaque lot doit avoir un nom
    const prizesWithoutName = prizes.filter((p) => !p.name || p.name.trim().length === 0);
    if (prizesWithoutName.length > 0) {
      return Result.fail(new Error('Tous les lots doivent avoir un nom'));
    }

    // Validation: Quantité positive
    const prizesWithInvalidQuantity = prizes.filter((p) => p.quantity <= 0);
    if (prizesWithInvalidQuantity.length > 0) {
      return Result.fail(new Error('La quantité de chaque lot doit être supérieure à 0'));
    }

    // Validation: Probabilité entre 0 et 100
    const prizesWithInvalidProbability = prizes.filter(
      (p) => p.probability < 0 || p.probability > 100,
    );
    if (prizesWithInvalidProbability.length > 0) {
      return Result.fail(new Error('La probabilité de chaque lot doit être entre 0 et 100'));
    }

    // Validation: Total des probabilités = 100%
    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
    const tolerance = 0.01; // Tolérance pour les arrondis

    if (Math.abs(totalProbability - 100) > tolerance) {
      return Result.fail(
        new Error(
          `La somme des probabilités doit être égale à 100% (actuellement: ${totalProbability.toFixed(2)}%)`,
        ),
      );
    }

    // Validation: Couleur valide (hex)
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    const prizesWithInvalidColor = prizes.filter((p) => !hexColorRegex.test(p.color));
    if (prizesWithInvalidColor.length > 0) {
      return Result.fail(
        new Error('Toutes les couleurs doivent être au format hexadécimal (#RRGGBB)'),
      );
    }

    return Result.ok(new PrizeConfiguration(prizes));
  }

  /**
   * Auto-calcul des probabilités équitables
   */
  public static autoCalculateProbabilities(
    prizes: Omit<PrizeConfig, 'probability'>[],
  ): PrizeConfig[] {
    const equalProbability = 100 / prizes.length;

    return prizes.map((prize, index) => {
      // Ajuster la dernière probabilité pour arriver exactement à 100%
      const probability =
        index === prizes.length - 1
          ? 100 - equalProbability * (prizes.length - 1)
          : equalProbability;

      return {
        ...prize,
        probability: Math.round(probability * 100) / 100, // Arrondir à 2 décimales
      };
    });
  }

  public getPrizes(): ReadonlyArray<PrizeConfig> {
    return this.prizes;
  }

  public getTotalPrizes(): number {
    return this.prizes.reduce((sum, p) => sum + p.quantity, 0);
  }

  public getPrizeCount(): number {
    return this.prizes.length;
  }
}
