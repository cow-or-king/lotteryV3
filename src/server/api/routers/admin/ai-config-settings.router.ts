/**
 * Admin AI Configuration Settings Router
 * Gestion des configurations IA (CRUD operations)
 * IMPORTANT: ZERO any types, Architecture Hexagonale
 */

import { z } from 'zod';
import { createTRPCRouter, superAdminProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';
import { ApiKeyEncryptionService } from '@/infrastructure/encryption/api-key-encryption.service';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const encryptionService = new ApiKeyEncryptionService();

/**
 * Router pour les opérations CRUD de configuration IA
 */
export const aiConfigSettingsRouter = createTRPCRouter({
  /**
   * Liste toutes les configurations IA
   * Accessible uniquement par super-admin
   */
  listAiConfigs: superAdminProcedure.query(async () => {
    const configs = await prisma.aiServiceConfig.findMany({
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });

    // Masquer les clés API (ne montrer que les 4 derniers caractères)
    return configs.map((config) => ({
      ...config,
      apiKey: `***${config.apiKey.slice(-4)}`,
    }));
  }),

  /**
   * Récupère une configuration par ID
   */
  getAiConfigById: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const config = await prisma.aiServiceConfig.findUnique({
        where: { id: input.id },
      });

      if (!config) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Configuration not found',
        });
      }

      // Masquer la clé API
      return {
        ...config,
        apiKey: `***${config.apiKey.slice(-4)}`,
      };
    }),

  /**
   * Crée une nouvelle configuration IA
   */
  createAiConfig: superAdminProcedure
    .input(
      z.object({
        provider: z.enum(['openai', 'anthropic']),
        apiKey: z.string().min(10, 'API key too short'),
        model: z.string().min(1, 'Model is required'),
        maxTokens: z.number().int().min(100).max(4000).default(1000),
        temperature: z.number().min(0).max(2).default(0.7),
        systemPrompt: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Chiffrer l'API key
      const encryptResult = encryptionService.encrypt(input.apiKey);
      if (!encryptResult.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to encrypt API key',
        });
      }

      // Créer la configuration
      const config = await prisma.aiServiceConfig.create({
        data: {
          provider: input.provider,
          apiKey: encryptResult.data,
          model: input.model,
          maxTokens: input.maxTokens,
          temperature: input.temperature,
          systemPrompt: input.systemPrompt || null,
          isActive: false, // Nouvelle config inactive par défaut
          apiKeyStatus: 'active',
          totalRequestsCount: 0,
          totalTokensUsed: 0,
        },
      });

      return {
        ...config,
        apiKey: `***${config.apiKey.slice(-4)}`,
      };
    }),

  /**
   * Met à jour une configuration existante
   */
  updateAiConfig: superAdminProcedure
    .input(
      z.object({
        id: z.string(),
        apiKey: z.string().min(10).optional(),
        model: z.string().min(1).optional(),
        maxTokens: z.number().int().min(100).max(4000).optional(),
        temperature: z.number().min(0).max(2).optional(),
        systemPrompt: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, apiKey, ...rest } = input;

      // Vérifier que la config existe
      const existing = await prisma.aiServiceConfig.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Configuration not found',
        });
      }

      // Si nouvelle API key, la chiffrer
      let encryptedApiKey: string | undefined;
      if (apiKey) {
        const encryptResult = encryptionService.encrypt(apiKey);
        if (!encryptResult.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to encrypt API key',
          });
        }
        encryptedApiKey = encryptResult.data;
      }

      // Mettre à jour
      const updated = await prisma.aiServiceConfig.update({
        where: { id },
        data: {
          ...(encryptedApiKey && { apiKey: encryptedApiKey }),
          ...rest,
        },
      });

      return {
        ...updated,
        apiKey: `***${updated.apiKey.slice(-4)}`,
      };
    }),

  /**
   * Active une configuration (désactive toutes les autres)
   */
  activateAiConfig: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const config = await prisma.aiServiceConfig.findUnique({
        where: { id: input.id },
      });

      if (!config) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Configuration not found',
        });
      }

      // Désactiver toutes les autres configs
      await prisma.aiServiceConfig.updateMany({
        where: { id: { not: input.id } },
        data: { isActive: false },
      });

      // Activer celle-ci
      const activated = await prisma.aiServiceConfig.update({
        where: { id: input.id },
        data: { isActive: true },
      });

      return {
        ...activated,
        apiKey: `***${activated.apiKey.slice(-4)}`,
      };
    }),

  /**
   * Désactive une configuration
   */
  deactivateAiConfig: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const deactivated = await prisma.aiServiceConfig.update({
        where: { id: input.id },
        data: { isActive: false },
      });

      return {
        ...deactivated,
        apiKey: `***${deactivated.apiKey.slice(-4)}`,
      };
    }),

  /**
   * Supprime une configuration
   */
  deleteAiConfig: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.aiServiceConfig.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Teste la connexion avec un provider IA
   */
  testAiConnection: superAdminProcedure
    .input(
      z.object({
        provider: z.enum(['openai', 'anthropic']),
        apiKey: z.string().min(10),
        model: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        if (input.provider === 'openai') {
          const client = new OpenAI({ apiKey: input.apiKey });
          // Test simple avec une completion
          const completion = await client.chat.completions.create({
            model: input.model,
            messages: [{ role: 'user', content: 'Test connection' }],
            max_tokens: 10,
          });

          return {
            success: true,
            provider: 'openai',
            model: input.model,
            message: 'Connection successful',
            tokensUsed: completion.usage?.total_tokens || 0,
          };
        } else if (input.provider === 'anthropic') {
          const client = new Anthropic({ apiKey: input.apiKey });
          // Test simple avec un message
          const message = await client.messages.create({
            model: input.model,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Test connection' }],
          });

          return {
            success: true,
            provider: 'anthropic',
            model: input.model,
            message: 'Connection successful',
            tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
          };
        }

        throw new Error('Unsupported provider');
      } catch (error) {
        const err = error as Error;
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Connection failed: ${err.message}`,
        });
      }
    }),
});
