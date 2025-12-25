/**
 * Store Mutations Router
 * Toutes les mutations (écritures) pour les stores
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';
import { uploadStoreLogoServer } from '@/lib/utils/supabase-storage';
import { generateAndLinkDefaultQRCode } from '@/lib/utils/qr-code-server-generator';

// Use Cases
import { CreateStoreUseCase, UpdateStoreUseCase, DeleteStoreUseCase } from '@/core/use-cases/store';

// Repositories
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma-store.repository';
import { PrismaBrandRepository } from '@/infrastructure/repositories/prisma-brand.repository';

// Services
import { ApiKeyEncryptionService } from '@/infrastructure/encryption/api-key-encryption.service';

// Instancier les repositories
const storeRepository = new PrismaStoreRepository();
const brandRepository = new PrismaBrandRepository();

// Anti-fraude repository
import { PrismaStoreHistoryRepository } from '@/infrastructure/repositories/prisma-store-history.repository';
const storeHistoryRepository = new PrismaStoreHistoryRepository();

// Instancier les services
const encryptionService = new ApiKeyEncryptionService();

// Instancier les use cases
const createStoreUseCase = new CreateStoreUseCase(
  storeRepository,
  brandRepository,
  storeHistoryRepository,
);
const updateStoreUseCase = new UpdateStoreUseCase(
  storeRepository,
  brandRepository,
  encryptionService,
);
const deleteStoreUseCase = new DeleteStoreUseCase(
  storeRepository,
  brandRepository,
  storeHistoryRepository,
);

export const storeMutationsRouter = createTRPCRouter({
  /**
   * Crée un nouveau store
   */
  create: protectedProcedure
    .input(
      z.object({
        brandId: z.string().optional(),
        brandName: z
          .string()
          .min(2, "Le nom de l'enseigne doit contenir au moins 2 caractères")
          .optional(),
        logoUrl: z
          .string()
          .optional()
          .refine(
            (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
            'URL du logo invalide',
          ),
        logoFileData: z.string().optional(),
        logoFileName: z.string().optional(),
        logoFileType: z
          .string()
          .optional()
          .refine(
            (type) =>
              !type || ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(type),
            'Format non supporté. Utilisez PNG, JPEG, WEBP ou SVG.',
          ),
        name: z.string().min(2, 'Le nom du commerce doit contenir au moins 2 caractères'),
        googleBusinessUrl: z.string().url('URL Google Business invalide'),
        googlePlaceId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Récupérer user et subscription pour l'anti-fraude
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: { subscription: true },
      });

      if (!user || !user.subscription) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Impossible de récupérer l'utilisateur ou son abonnement",
        });
      }

      const result = await createStoreUseCase.execute(
        {
          ...input,
          userEmail: user.email,
          isFreePlan: user.subscription.plan === 'FREE',
        },
        ctx.user.id,
      );

      if (!result.success) {
        const errorMessage = result.error.message;

        if (errorMessage.includes('non trouvée') || errorMessage.includes('appartient pas')) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: errorMessage,
          });
        }

        if (errorMessage.includes('devez soit')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: errorMessage,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: errorMessage,
        });
      }

      // Upload du logo si un fichier est fourni
      if (input.logoFileData && input.logoFileName && input.logoFileType) {
        try {
          const ACCEPTED_FORMATS = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
          if (!ACCEPTED_FORMATS.includes(input.logoFileType)) {
            throw new Error('Format non supporté. Utilisez PNG, JPEG, WEBP ou SVG.');
          }

          const base64Data = input.logoFileData.split(',')[1] || input.logoFileData;
          const buffer = Buffer.from(base64Data, 'base64');

          const MAX_SIZE = 2 * 1024 * 1024;
          if (buffer.length > MAX_SIZE) {
            throw new Error('Fichier trop volumineux (max 2MB)');
          }

          const file = new File([buffer], input.logoFileName, { type: input.logoFileType });

          const { url } = await uploadStoreLogoServer(result.data.brandId, file);

          await prisma.brand.update({
            where: { id: result.data.brandId },
            data: { logoUrl: url },
          });
        } catch (_error) {
          // Error uploading logo, continue without logo
        }
      }

      // Générer automatiquement un QR Code par défaut
      generateAndLinkDefaultQRCode({
        storeId: result.data.id,
        storeName: result.data.name,
        storeSlug: result.data.slug,
        userId: ctx.user.id,
      }).catch((_error) => {
        // Error generating default QR code, continue
      });

      const brand = await prisma.brand.findUnique({
        where: { id: result.data.brandId },
      });

      return {
        ...result.data,
        brand,
      };
    }),

  /**
   * Met à jour un store
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        googleBusinessUrl: z.string().url().optional(),
        googlePlaceId: z.string().optional(),
        googleApiKey: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await updateStoreUseCase.execute(input, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Supprime un store
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Récupérer user et subscription pour l'anti-fraude
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: { subscription: true },
      });

      if (!user || !user.subscription) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Impossible de récupérer l'utilisateur ou son abonnement",
        });
      }

      const result = await deleteStoreUseCase.execute(
        {
          id: input.id,
          userEmail: user.email,
          isFreePlan: user.subscription.plan === 'FREE',
        },
        ctx.user.id,
      );

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return { success: true };
    }),
});
