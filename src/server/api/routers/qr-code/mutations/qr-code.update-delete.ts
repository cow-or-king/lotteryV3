/**
 * QR Code Update/Delete Mutations
 * Mise à jour et suppression de QR codes
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import type { QRCodeType, QRCodeStyle, QRCodeAnimation } from '@/lib/types/qr-code.types';

// Zod enums
const QRCodeTypeEnum = z.enum(['STATIC', 'DYNAMIC']);
const QRCodeStyleEnum = z.enum(['DOTS', 'ROUNDED', 'SQUARE', 'CLASSY', 'CIRCULAR']);
const QRCodeAnimationEnum = z.enum([
  'NONE',
  'RIPPLE',
  'PULSE',
  'GLOW',
  'ROTATE3D',
  'WAVE',
  'CIRCULAR_RIPPLE',
]);
const ErrorCorrectionLevelEnum = z.enum(['L', 'M', 'Q', 'H']);

export const qrCodeUpdateDeleteRouter = createTRPCRouter({
  /**
   * Met à jour un QR code
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        url: z.string().url().optional(),
        type: QRCodeTypeEnum.optional(),
        style: QRCodeStyleEnum.optional(),
        animation: QRCodeAnimationEnum.nullable().optional(),
        foregroundColor: z.string().optional(),
        backgroundColor: z.string().optional(),
        logoUrl: z.string().nullable().optional(),
        logoStoragePath: z.string().nullable().optional(),
        logoSize: z.number().int().min(20).max(400).nullable().optional(),
        size: z.number().int().min(256).max(2048).optional(),
        errorCorrectionLevel: ErrorCorrectionLevelEnum.optional(),
        storeId: z.string().nullable().optional(),
        campaignId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingQRCode = await prisma.qRCode.findUnique({
        where: { id: input.id },
      });

      if (!existingQRCode) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'QR code non trouvé',
        });
      }

      if (existingQRCode.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'avez pas accès à ce QR code",
        });
      }

      // Verify store ownership if storeId is being updated
      if (input.storeId !== undefined && input.storeId !== null) {
        const store = await prisma.store.findUnique({
          where: { id: input.storeId },
          include: {
            brand: {
              select: {
                ownerId: true,
              },
            },
          },
        });

        if (!store || store.brand.ownerId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: "Vous n'avez pas accès à ce commerce",
          });
        }
      }

      const { id, ...updateData } = input;

      const qrCode = await prisma.qRCode.update({
        where: { id },
        data: updateData,
      });

      return {
        id: qrCode.id,
        name: qrCode.name,
        url: qrCode.url,
        type: qrCode.type as QRCodeType,
        style: qrCode.style as QRCodeStyle,
        animation: qrCode.animation as QRCodeAnimation | null,
        foregroundColor: qrCode.foregroundColor,
        backgroundColor: qrCode.backgroundColor,
        logoUrl: qrCode.logoUrl,
        logoStoragePath: qrCode.logoStoragePath,
        logoSize: qrCode.logoSize,
        size: qrCode.size,
        errorCorrectionLevel: qrCode.errorCorrectionLevel,
        storeId: qrCode.storeId,
        campaignId: qrCode.campaignId,
        scansCount: qrCode.scanCount,
        createdAt: qrCode.createdAt,
        updatedAt: qrCode.updatedAt,
      };
    }),

  /**
   * Supprime un QR code
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const qrCode = await prisma.qRCode.findUnique({
        where: { id: input.id },
      });

      if (!qrCode) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'QR code non trouvé',
        });
      }

      if (qrCode.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'avez pas accès à ce QR code",
        });
      }

      await prisma.qRCode.delete({
        where: { id: input.id },
      });

      // Delete logo from Supabase Storage if it exists
      if (qrCode.logoStoragePath) {
        try {
          await supabaseAdmin.storage.from('qr-logos').remove([qrCode.logoStoragePath]);
        } catch (error) {
          logger.error('Failed to delete logo from storage:', error);
          // Continue anyway, don't block QR code deletion
        }
      }

      return { success: true };
    }),
});
