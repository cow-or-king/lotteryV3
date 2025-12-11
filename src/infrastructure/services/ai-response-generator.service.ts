/**
 * AI Response Generator Service Implementation
 * Service de génération de réponses IA (OpenAI + Anthropic)
 * IMPORTANT: Multi-tenant avec API key centralisée (super-admin)
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Result } from '@/lib/types/result.type';
import {
  IAiResponseGeneratorService,
  GenerateResponseInput,
  GenerateResponseOutput,
} from '@/core/services/ai-response-generator.service.interface';
import { ApiKeyEncryptionService } from '@/infrastructure/encryption/api-key-encryption.service';
import { PrismaClient } from '@/generated/prisma';

/**
 * Service de génération de réponses IA
 * Utilise la configuration centralisée du super-admin
 */
export class AiResponseGeneratorService implements IAiResponseGeneratorService {
  private openaiClient: OpenAI | null = null;
  private anthropicClient: Anthropic | null = null;
  private encryptionService: ApiKeyEncryptionService;

  constructor(
    private readonly prisma: PrismaClient,
    encryptionService?: ApiKeyEncryptionService,
  ) {
    this.encryptionService = encryptionService || new ApiKeyEncryptionService();
  }

  /**
   * Vérifie si le service IA est disponible
   */
  async isAvailable(): Promise<boolean> {
    try {
      const config = await this.prisma.aiServiceConfig.findFirst({
        where: {
          isActive: true,
          apiKeyStatus: 'active',
        },
      });

      return config !== null;
    } catch (error) {
      console.error('[AI Service] Error checking availability:', error);
      return false;
    }
  }

  /**
   * Retourne le provider actif
   */
  async getActiveProvider(): Promise<string | null> {
    try {
      const config = await this.prisma.aiServiceConfig.findFirst({
        where: {
          isActive: true,
          apiKeyStatus: 'active',
        },
      });

      return config?.provider || null;
    } catch (error) {
      console.error('[AI Service] Error getting provider:', error);
      return null;
    }
  }

  /**
   * Génère une réponse suggérée pour un avis
   */
  async generateResponse(input: GenerateResponseInput): Promise<Result<GenerateResponseOutput>> {
    try {
      // 1. Charger la configuration active
      const config = await this.prisma.aiServiceConfig.findFirst({
        where: {
          isActive: true,
          apiKeyStatus: 'active',
        },
      });

      if (!config) {
        return Result.fail(new Error('No active AI service configuration found'));
      }

      // 2. Déchiffrer l'API key
      const decryptResult = this.encryptionService.decrypt(config.apiKey);
      if (!decryptResult.success) {
        return Result.fail(new Error('Failed to decrypt AI API key'));
      }

      const apiKey = decryptResult.data;

      // 3. Générer la réponse selon le provider
      let result: GenerateResponseOutput;

      if (config.provider === 'openai') {
        result = await this.generateWithOpenAI(input, apiKey, config.model, config);
      } else if (config.provider === 'anthropic') {
        result = await this.generateWithAnthropic(input, apiKey, config.model, config);
      } else {
        return Result.fail(new Error(`Unsupported AI provider: ${config.provider}`));
      }

      // 4. Mettre à jour les statistiques
      await this.updateStats(config.id, result.tokensUsed);

      return Result.ok(result);
    } catch (error) {
      console.error('[AI Service] Generation error:', error);
      return Result.fail(error as Error);
    }
  }

  /**
   * Génération avec OpenAI
   */
  private async generateWithOpenAI(
    input: GenerateResponseInput,
    apiKey: string,
    model: string,
    config: { maxTokens: number; temperature: number; systemPrompt: string | null },
  ): Promise<GenerateResponseOutput> {
    if (!this.openaiClient) {
      this.openaiClient = new OpenAI({ apiKey });
    }

    const systemPrompt = config.systemPrompt || this.buildSystemPrompt(input);
    const userPrompt = this.buildUserPrompt(input);

    const completion = await this.openaiClient.chat.completions.create({
      model: model || 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    });

    const response = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    return {
      suggestedResponse: response.trim(),
      confidence: this.calculateConfidence(input.reviewRating),
      sentiment: this.determineSentiment(input.reviewRating),
      tokensUsed,
      provider: 'openai',
      model: model || 'gpt-4',
    };
  }

  /**
   * Génération avec Anthropic (Claude)
   */
  private async generateWithAnthropic(
    input: GenerateResponseInput,
    apiKey: string,
    model: string,
    config: { maxTokens: number; temperature: number; systemPrompt: string | null },
  ): Promise<GenerateResponseOutput> {
    if (!this.anthropicClient) {
      this.anthropicClient = new Anthropic({ apiKey });
    }

    const systemPrompt = config.systemPrompt || this.buildSystemPrompt(input);
    const userPrompt = this.buildUserPrompt(input);

    const message = await this.anthropicClient.messages.create({
      model: model || 'claude-3-sonnet-20240229',
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const response =
      message.content[0] && message.content[0].type === 'text' ? message.content[0].text : '';
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

    return {
      suggestedResponse: response.trim(),
      confidence: this.calculateConfidence(input.reviewRating),
      sentiment: this.determineSentiment(input.reviewRating),
      tokensUsed,
      provider: 'anthropic',
      model: model || 'claude-3-sonnet-20240229',
    };
  }

  /**
   * Construit le system prompt
   */
  private buildSystemPrompt(input: GenerateResponseInput): string {
    const lang = input.language === 'fr' ? 'français' : 'English';
    const emojiInstruction = input.includeEmojis
      ? `Tu PEUX utiliser des émojis pertinents (étoiles ⭐, cœurs ❤️, etc.) pour rendre la réponse plus chaleureuse et engageante.`
      : `N'utilise PAS d'émojis.`;

    return `Tu es un assistant IA spécialisé dans la rédaction de réponses professionnelles aux avis Google pour le commerce "${input.storeName}".

Ton rôle :
- Générer des réponses ${lang} authentiques, professionnelles et personnalisées
- Adapter le ton selon le type d'avis (positif/neutre/négatif)
- ${emojiInstruction}
- Rester concis (2-4 phrases maximum)
- Remercier le client et mentionner son prénom
- Pour les avis négatifs : s'excuser, montrer de l'empathie, proposer une solution
- Pour les avis positifs : remercier chaleureusement, inviter à revenir

Ton utilisé : ${input.tone === 'professional' ? 'professionnel' : input.tone === 'friendly' ? 'amical et chaleureux' : 'empathique et conciliant'}

IMPORTANT : Ta réponse sera publiée DIRECTEMENT sur Google Reviews, assure-toi qu'elle soit parfaite.`;
  }

  /**
   * Construit le user prompt
   */
  private buildUserPrompt(input: GenerateResponseInput): string {
    const reviewText = input.reviewContent || '[Aucun commentaire écrit]';

    return `Génère une réponse pour cet avis Google :

**Auteur :** ${input.authorName}
**Note :** ${input.reviewRating}/5 étoiles
**Commentaire :** "${reviewText}"

Génère une réponse appropriée en ${input.language === 'fr' ? 'français' : 'anglais'}.`;
  }

  /**
   * Détermine le sentiment basé sur le rating
   */
  private determineSentiment(rating: number): 'positive' | 'neutral' | 'negative' {
    if (rating >= 4) {
      return 'positive';
    }
    if (rating === 3) {
      return 'neutral';
    }
    return 'negative';
  }

  /**
   * Calcule la confiance de la réponse
   */
  private calculateConfidence(rating: number): number {
    // Plus de confiance pour les avis extrêmes (très positifs ou très négatifs)
    if (rating === 5 || rating === 1) {
      return 0.95;
    }
    if (rating === 4 || rating === 2) {
      return 0.85;
    }
    return 0.75; // Rating 3 (neutre)
  }

  /**
   * Met à jour les statistiques d'usage
   */
  private async updateStats(configId: string, tokensUsed: number): Promise<void> {
    try {
      await this.prisma.aiServiceConfig.update({
        where: { id: configId },
        data: {
          lastUsedAt: new Date(),
          totalRequestsCount: { increment: 1 },
          totalTokensUsed: { increment: tokensUsed },
        },
      });
    } catch (error) {
      console.error('[AI Service] Error updating stats:', error);
      // Non-blocking, on ne throw pas
    }
  }
}
