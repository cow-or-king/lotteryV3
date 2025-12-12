/**
 * QR Code Create Mutations
 * Création de QR codes (simple et batch)
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';
import { generateShortCode } from '@/lib/utils/short-code';
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

export const qrCodeCreateRouter = createTRPCRouter({
  /**
   * Crée un nouveau QR code
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
        url: z.string().url('URL invalide'),
        type: QRCodeTypeEnum.default('STATIC'),
        style: QRCodeStyleEnum.default('DOTS'),
        animation: QRCodeAnimationEnum.nullable().default('NONE'),
        foregroundColor: z.string().default('#000000'),
        backgroundColor: z.string().default('#FFFFFF'),
        logoUrl: z.string().nullable().optional(),
        logoStoragePath: z.string().nullable().optional(),
        logoSize: z.number().int().min(20).max(400).nullable().optional(),
        size: z.number().int().min(256).max(2048).default(512),
        errorCorrectionLevel: ErrorCorrectionLevelEnum.default('M'),
        storeId: z.string().nullable().optional(),
        campaignId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify store ownership if storeId is provided
      if (input.storeId) {
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

      // Filter out blob URLs as they can't be saved
      const logoUrl = input.logoUrl?.startsWith('blob:') ? null : input.logoUrl;

      // Generate short code for dynamic QR codes
      let shortCode: string | null = null;
      if (input.type === 'DYNAMIC') {
        let isUnique = false;
        while (!isUnique) {
          shortCode = generateShortCode(8);
          const existing = await prisma.qRCode.findUnique({
            where: { shortCode },
          });
          if (!existing) {
            isUnique = true;
          }
        }
      }

      const qrCode = await prisma.qRCode.create({
        data: {
          name: input.name,
          url: input.url,
          shortCode,
          type: input.type,
          style: input.style,
          animation: input.animation,
          foregroundColor: input.foregroundColor,
          backgroundColor: input.backgroundColor,
          logoUrl,
          logoStoragePath: input.logoStoragePath,
          logoSize: input.logoSize,
          size: input.size,
          errorCorrectionLevel: input.errorCorrectionLevel,
          storeId: input.storeId,
          campaignId: input.campaignId,
          createdBy: ctx.user.id,
        },
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
   * Crée plusieurs QR codes à la fois (batch)
   */
  createBatch: protectedProcedure
    .input(
      z.object({
        qrCodes: z
          .array(
            z.object({
              name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
              url: z.string().url('URL invalide'),
            }),
          )
          .min(1)
          .max(50),
        type: QRCodeTypeEnum.default('STATIC'),
        style: QRCodeStyleEnum.default('DOTS'),
        animation: QRCodeAnimationEnum.nullable().default('NONE'),
        foregroundColor: z.string().default('#000000'),
        backgroundColor: z.string().default('#FFFFFF'),
        logoUrl: z.string().nullable().optional(),
        logoStoragePath: z.string().nullable().optional(),
        logoSize: z.number().int().min(20).max(400).nullable().optional(),
        size: z.number().int().min(256).max(2048).default(512),
        errorCorrectionLevel: ErrorCorrectionLevelEnum.default('M'),
        storeId: z.string().nullable().optional(),
        campaignId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify store ownership
      if (input.storeId) {
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

      // Filter out blob URLs
      const logoUrl = input.logoUrl?.startsWith('blob:') ? null : input.logoUrl;

      // Prepare QR codes data
      const qrCodesData = await Promise.all(
        input.qrCodes.map(async (qrCodeInput) => {
          let shortCode: string | null = null;
          if (input.type === 'DYNAMIC') {
            let isUnique = false;
            while (!isUnique) {
              shortCode = generateShortCode(8);
              const existing = await prisma.qRCode.findUnique({
                where: { shortCode },
              });
              if (!existing) {
                isUnique = true;
              }
            }
          }

          return {
            name: qrCodeInput.name,
            url: qrCodeInput.url,
            shortCode,
            type: input.type,
            style: input.style,
            animation: input.animation,
            foregroundColor: input.foregroundColor,
            backgroundColor: input.backgroundColor,
            logoUrl,
            logoStoragePath: input.logoStoragePath,
            logoSize: input.logoSize,
            size: input.size,
            errorCorrectionLevel: input.errorCorrectionLevel,
            storeId: input.storeId,
            campaignId: input.campaignId,
            createdBy: ctx.user.id,
          };
        }),
      );

      // Create all QR codes in a transaction
      const createdQRCodes = await prisma.$transaction(
        qrCodesData.map((data) => prisma.qRCode.create({ data })),
      );

      return {
        count: createdQRCodes.length,
        qrCodes: createdQRCodes.map((qrCode) => ({
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
        })),
      };
    }),
});
