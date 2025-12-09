/**
 * AI Response Generator Service Interface (Port)
 * Génère des réponses automatiques pour les avis Google avec IA
 * IMPORTANT: Interface pour respecter Dependency Inversion Principle
 */

import { Result } from '@/lib/types/result.type';

// DTO Input
export interface GenerateResponseInput {
  readonly reviewContent: string | null;
  readonly reviewRating: number; // 1-5
  readonly authorName: string;
  readonly storeName: string;
  readonly tone: 'professional' | 'friendly' | 'apologetic';
  readonly language: 'fr' | 'en';
  readonly includeEmojis?: boolean;
}

// DTO Output
export interface GenerateResponseOutput {
  readonly suggestedResponse: string;
  readonly confidence: number; // 0-1
  readonly sentiment: 'positive' | 'neutral' | 'negative';
  readonly tokensUsed: number;
  readonly provider: string; // "openai" | "anthropic"
  readonly model: string;
}

/**
 * Interface IAiResponseGeneratorService
 * Port pour la génération de réponses par IA
 */
export interface IAiResponseGeneratorService {
  /**
   * Génère une réponse suggérée pour un avis Google
   */
  generateResponse(input: GenerateResponseInput): Promise<Result<GenerateResponseOutput>>;

  /**
   * Vérifie si le service IA est disponible et configuré
   */
  isAvailable(): Promise<boolean>;

  /**
   * Retourne le provider actif ("openai" | "anthropic")
   */
  getActiveProvider(): Promise<string | null>;
}
