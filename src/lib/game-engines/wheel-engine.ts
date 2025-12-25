/**
 * Wheel Game Engine
 * Moteur de jeu pour la roue de la fortune
 * Gère la logique de calcul des probabilités et de sélection du prix
 */

import type { WheelGameConfig, WheelSegment } from '../types/game.types';

export interface SpinResult {
  winningSegment: WheelSegment;
  rotationDegrees: number; // Rotation finale en degrés
  spinDuration: number; // Durée du spin en ms
}

export class WheelEngine {
  private config: WheelGameConfig;

  constructor(config: WheelGameConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Valide la configuration de la roue
   */
  private validateConfig(): void {
    const { segments } = this.config;

    if (segments.length === 0) {
      throw new Error('La roue doit contenir au moins un segment');
    }

    // Vérifier que la somme des probabilités = 100%
    const totalProbability = segments.reduce((sum, segment) => sum + segment.probability, 0);
    if (Math.abs(totalProbability - 100) > 0.01) {
      throw new Error(
        `La somme des probabilités doit égaler 100% (actuellement: ${totalProbability}%)`,
      );
    }

    // Vérifier qu'il n'y a pas de segments vides
    const emptySegment = segments.find((s) => !s.label.trim());
    if (emptySegment) {
      throw new Error('Tous les segments doivent avoir un libellé');
    }
  }

  /**
   * Lance la roue et détermine le segment gagnant
   * Utilise une sélection pondérée par probabilité
   * @param forcedSegmentId - Si fourni, force la roue à s'arrêter sur ce segment (pour sync serveur)
   */
  spin(forcedSegmentId?: string): SpinResult {
    const winningSegment = forcedSegmentId
      ? this.config.segments.find((s) => s.id === forcedSegmentId) || this.selectWinningSegment()
      : this.selectWinningSegment();
    const segmentIndex = this.config.segments.findIndex((s) => s.id === winningSegment.id);

    // Calculer l'angle de destination
    const segmentAngle = 360 / this.config.segments.length;
    const targetAngle = segmentIndex * segmentAngle + segmentAngle / 2;

    // Ajouter des rotations complètes pour l'effet visuel (3 à 7 tours)
    const fullRotations = Math.floor(Math.random() * 5) + 3; // 3-7 tours
    const totalRotation = fullRotations * 360 + (360 - targetAngle);

    // Calculer la durée du spin (3 à 6 secondes)
    const spinDuration = Math.floor(Math.random() * 3000) + 3000; // 3000-6000ms

    return {
      winningSegment,
      rotationDegrees: totalRotation,
      spinDuration,
    };
  }

  /**
   * Sélectionne un segment gagnant basé sur les probabilités
   * Utilise l'algorithme de la roue de la fortune (Roulette Wheel Selection)
   */
  private selectWinningSegment(): WheelSegment {
    const random = Math.random() * 100; // 0-100
    let cumulativeProbability = 0;

    for (const segment of this.config.segments) {
      cumulativeProbability += segment.probability;
      if (random <= cumulativeProbability) {
        return segment;
      }
    }

    // Fallback au dernier segment (ne devrait jamais arriver avec validation correcte)
    const lastSegment = this.config.segments[this.config.segments.length - 1];
    if (!lastSegment) {
      throw new Error('Wheel configuration error: no segments available');
    }
    return lastSegment;
  }

  /**
   * Calcule l'angle final pour pointer vers un segment spécifique
   * Utilisé pour forcer un résultat (mode test ou admin)
   */
  calculateAngleForSegment(segmentId: string): number {
    const segmentIndex = this.config.segments.findIndex((s) => s.id === segmentId);
    if (segmentIndex === -1) {
      throw new Error(`Segment ${segmentId} non trouvé`);
    }

    const segmentAngle = 360 / this.config.segments.length;
    return segmentIndex * segmentAngle + segmentAngle / 2;
  }

  /**
   * Crée une configuration par défaut pour la roue
   */
  static createDefaultConfig(): Partial<WheelGameConfig> {
    return {
      segments: [
        {
          id: '1',
          label: 'Café offert',
          color: '#8B5CF6',
          probability: 20,
          prize: { type: 'PRIZE', value: 'Café offert' },
        },
        {
          id: '2',
          label: '-10%',
          color: '#EC4899',
          probability: 30,
          prize: { type: 'DISCOUNT', value: '10' },
        },
        {
          id: '3',
          label: 'Perdu',
          color: '#6B7280',
          probability: 25,
          prize: { type: 'NOTHING', value: '' },
        },
        {
          id: '4',
          label: 'Dessert offert',
          color: '#10B981',
          probability: 15,
          prize: { type: 'PRIZE', value: 'Dessert offert' },
        },
        {
          id: '5',
          label: '-20%',
          color: '#F59E0B',
          probability: 10,
          prize: { type: 'DISCOUNT', value: '20' },
        },
      ],
    };
  }

  /**
   * Calcule les statistiques de probabilité
   */
  getStatistics(): {
    totalSegments: number;
    winRatePercentage: number;
    averagePrizeValue: number;
  } {
    const totalSegments = this.config.segments.length;
    const winRate = this.config.segments
      .filter((s) => s.prize.type !== 'NOTHING')
      .reduce((sum, s) => sum + s.probability, 0);

    return {
      totalSegments,
      winRatePercentage: winRate,
      averagePrizeValue: 0, // TODO: calculer la valeur moyenne des prix
    };
  }
}
