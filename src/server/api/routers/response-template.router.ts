/**
 * Response Template Router
 * Routes tRPC pour la gestion des templates de réponse
 * IMPORTANT: ZERO any types
 * Architecture Hexagonale: Router → Use Cases → Repositories
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';

// Use Cases
import { CreateResponseTemplateUseCase } from '@/core/use-cases/response-template/create-response-template.use-case';
import { UpdateResponseTemplateUseCase } from '@/core/use-cases/response-template/update-response-template.use-case';
import { DeleteResponseTemplateUseCase } from '@/core/use-cases/response-template/delete-response-template.use-case';
import { ListResponseTemplatesUseCase } from '@/core/use-cases/response-template/list-response-templates.use-case';

// Repositories (Adapters)
import { PrismaResponseTemplateRepository } from '@/infrastructure/repositories/prisma-response-template.repository';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma-store.repository';

// Instancier les repositories
const templateRepository = new PrismaResponseTemplateRepository(prisma);
const storeRepository = new PrismaStoreRepository();

// Instancier les use cases
const createTemplateUseCase = new CreateResponseTemplateUseCase(
  templateRepository,
  storeRepository,
);
const updateTemplateUseCase = new UpdateResponseTemplateUseCase(templateRepository);
const deleteTemplateUseCase = new DeleteResponseTemplateUseCase(templateRepository);
const listTemplatesUseCase = new ListResponseTemplatesUseCase(templateRepository, storeRepository);

export const responseTemplateRouter = createTRPCRouter({
  /**
   * Crée un nouveau template de réponse
   */
  create: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
        content: z.string().min(10, 'Le contenu doit contenir au moins 10 caractères'),
        category: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le store appartient à l'utilisateur
      const store = await prisma.store.findUnique({
        where: { id: input.storeId },
        include: {
          brand: true,
        },
      });

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store not found',
        });
      }

      if (store.brand.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this store',
        });
      }

      const result = await createTemplateUseCase.execute({
        storeId: input.storeId as string & { readonly __brand: unique symbol },
        name: input.name,
        content: input.content,
        category: input.category,
      });

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Met à jour un template existant
   */
  update: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        name: z.string().min(2).optional(),
        content: z.string().min(10).optional(),
        category: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le template existe et appartient à l'utilisateur
      const template = await prisma.responseTemplate.findUnique({
        where: { id: input.templateId },
        include: {
          store: {
            include: {
              brand: true,
            },
          },
        },
      });

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        });
      }

      if (template.store.brand.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this template',
        });
      }

      const result = await updateTemplateUseCase.execute(input);

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Supprime un template
   */
  delete: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le template existe et appartient à l'utilisateur
      const template = await prisma.responseTemplate.findUnique({
        where: { id: input.templateId },
        include: {
          store: {
            include: {
              brand: true,
            },
          },
        },
      });

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        });
      }

      if (template.store.brand.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this template',
        });
      }

      const result = await deleteTemplateUseCase.execute({
        templateId: input.templateId,
      });

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return { success: true };
    }),

  /**
   * Liste les templates d'un commerce
   */
  listByStore: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        category: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
        popularOnly: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Vérifier que le store appartient à l'utilisateur
      const store = await prisma.store.findUnique({
        where: { id: input.storeId },
        include: {
          brand: true,
        },
      });

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store not found',
        });
      }

      if (store.brand.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this store',
        });
      }

      const result = await listTemplatesUseCase.execute({
        storeId: input.storeId as string & { readonly __brand: unique symbol },
        category: input.category,
        popularOnly: input.popularOnly,
      });

      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Incrémente le compteur d'utilisation d'un template
   */
  incrementUsage: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le template existe et appartient à l'utilisateur
      const template = await prisma.responseTemplate.findUnique({
        where: { id: input.templateId },
        include: {
          store: {
            include: {
              brand: true,
            },
          },
        },
      });

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        });
      }

      if (template.store.brand.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this template',
        });
      }

      const result = await templateRepository.incrementUsage(input.templateId);

      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error.message,
        });
      }

      return { success: true };
    }),
});
