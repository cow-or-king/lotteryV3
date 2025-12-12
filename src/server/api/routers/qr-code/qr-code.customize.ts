/**
 * QR Code Customization Router
 * Endpoints pour personnaliser et exporter les QR codes par défaut des Stores
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { customizeStoreQRCode, generateQRCodeDownloadUrl } from '@/lib/utils/qr-code-customizer';
import { logger } from '@/lib/utils/logger';

// Zod enums
const QRCodeStyleEnum = z.enum(['DOTS', 'ROUNDED', 'SQUARE', 'CLASSY', 'CIRCULAR']);
const ErrorCorrectionLevelEnum = z.enum(['L', 'M', 'Q', 'H']);
const LogoSizeEnum = z.enum(['SMALL', 'MEDIUM', 'LARGE']);
const ExportFormatEnum = z.enum(['SVG', 'PNG']);

export const qrCodeCustomizeRouter = createTRPCRouter({
  /**
   * Personnalise un QR Code par défaut de Store
   * - Vérifie que le QR Code n'est pas déjà personnalisé
   * - Génère SVG + PNG HD
   * - Upload vers Supabase Storage
   * - Verrouille le QR Code (ne peut plus être modifié)
   */
  customize: protectedProcedure
    .input(
      z.object({
        qrCodeId: z.string().min(1, 'QR Code ID requis'),
        style: QRCodeStyleEnum,
        foregroundColor: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur foreground invalide (format: #RRGGBB)'),
        backgroundColor: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur background invalide (format: #RRGGBB)'),
        logoSize: LogoSizeEnum.nullable(),
        errorCorrectionLevel: ErrorCorrectionLevelEnum,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await customizeStoreQRCode({
          qrCodeId: input.qrCodeId,
          style: input.style,
          foregroundColor: input.foregroundColor,
          backgroundColor: input.backgroundColor,
          logoSize: input.logoSize,
          errorCorrectionLevel: input.errorCorrectionLevel,
          userId: ctx.user.id,
        });

        if (!result.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: result.error || 'Échec de la personnalisation',
          });
        }

        logger.info(`QR Code ${input.qrCodeId} customized by user ${ctx.user.id}`, {
          style: input.style,
          logoSize: input.logoSize,
        });

        return {
          success: true,
          qrCodeId: input.qrCodeId,
          svgUrl: result.svgUrl!,
          pngUrl: result.pngUrl!,
          customizedAt: result.customizedAt!,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logger.error('Customize QR Code error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la personnalisation du QR Code',
        });
      }
    }),

  /**
   * Génère un signed URL pour télécharger un QR Code personnalisé
   * - Vérifie ownership
   * - Génère une URL signée Supabase (expire dans 1h)
   */
  export: protectedProcedure
    .input(
      z.object({
        qrCodeId: z.string().min(1, 'QR Code ID requis'),
        format: ExportFormatEnum,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await generateQRCodeDownloadUrl(input.qrCodeId, input.format, ctx.user.id);

        if (!result.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: result.error || 'Échec de la génération du lien de téléchargement',
          });
        }

        logger.info(`Export QR Code ${input.qrCodeId} (${input.format}) by user ${ctx.user.id}`);

        // Calculer l'expiration (1h à partir de maintenant)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        return {
          downloadUrl: result.downloadUrl!,
          expiresAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logger.error('Export QR Code error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Erreur lors de l'export du QR Code",
        });
      }
    }),
});
