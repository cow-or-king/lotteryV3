/**
 * QR Code Storage
 * Gestion du storage Supabase pour les logos de QR codes
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateShortCode } from '@/lib/utils/short-code';
import { logger } from '@/lib/utils/logger';

// Constants pour validation
const ACCEPTED_LOGO_FORMATS = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_LOGO_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const qrCodeStorageRouter = createTRPCRouter({
  /**
   * Upload un logo vers Supabase Storage
   */
  uploadLogo: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // Base64
        contentType: z
          .string()
          .refine(
            (type) => ACCEPTED_LOGO_FORMATS.includes(type),
            'Format non supporté. Utilisez PNG, JPEG, WEBP ou SVG.',
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validation du contentType (double check)
      if (!ACCEPTED_LOGO_FORMATS.includes(input.contentType)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Format non supporté. Utilisez PNG, JPEG, WEBP ou SVG.',
        });
      }

      // Convert base64 to buffer
      const base64Data = input.fileData.split(',')[1];
      if (!base64Data) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid file data',
        });
      }

      const buffer = Buffer.from(base64Data, 'base64');

      // Validation de la taille
      if (buffer.length > MAX_LOGO_FILE_SIZE) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Fichier trop volumineux (max 2MB)',
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = generateShortCode(6);
      const extension = input.fileName.split('.').pop();
      const storagePath = `${ctx.user.id}/${timestamp}-${randomString}.${extension}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseAdmin.storage
        .from('qr-logos')
        .upload(storagePath, buffer, {
          contentType: input.contentType,
          upsert: false,
        });

      if (uploadError) {
        logger.error('Supabase upload error:', uploadError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload logo',
        });
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage.from('qr-logos').getPublicUrl(storagePath);

      return {
        url: urlData.publicUrl,
        storagePath,
      };
    }),

  /**
   * Supprime un logo de Supabase Storage
   */
  deleteLogo: protectedProcedure
    .input(
      z.object({
        storagePath: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { error } = await supabaseAdmin.storage.from('qr-logos').remove([input.storagePath]);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete logo',
        });
      }

      return { success: true };
    }),
});
