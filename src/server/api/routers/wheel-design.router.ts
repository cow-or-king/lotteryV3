/**
 * Wheel Design Router
 * TRPC router pour la gestion des designs de roue
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// =====================
// SCHEMAS DE VALIDATION
// =====================

const WheelSegmentDesignSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(),
  textColor: z.string().optional(),
});

const WheelDesignConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Le nom est requis'),
  colorMode: z.enum(['BI_COLOR', 'MULTI_COLOR']),
  primaryColor: z.string().nullable().optional(),
  secondaryColor: z.string().nullable().optional(),
  segments: z.array(WheelSegmentDesignSchema),
  numberOfSegments: z.number().int().min(4).max(12),
  centerLogoUrl: z.string().nullable(),
  centerLogoSize: z.number().int().default(80),
  backgroundColor: z.string().default('#FFFFFF'),
  segmentBorderWidth: z.number().int().default(2),
  segmentBorderColor: z.string().default('#FFFFFF'),
  showSegmentText: z.boolean().default(true),
  textSize: z.number().int().default(16),
  textFont: z.string().default('Arial'),
  textRotation: z.number().int().default(0),
  centerCircleColor: z.string().default('#FFFFFF'),
  centerCircleSize: z.number().int().default(100),
  pointerColor: z.string().default('#FBBF24'),
  pointerStyle: z.enum(['arrow', 'triangle', 'circle']).default('arrow'),
  animationSpeed: z.enum(['slow', 'normal', 'fast']).default('normal'),
  spinDuration: z.number().int().default(4000),
  enableSound: z.boolean().default(true),
  isDefault: z.boolean().optional(),
});

// =====================
// ROUTER
// =====================

export const wheelDesignRouter = createTRPCRouter({
  /**
   * Sauvegarder un nouveau design de roue
   */
  create: protectedProcedure.input(WheelDesignConfigSchema).mutation(async ({ ctx, input }) => {
    try {
      const design = await ctx.prisma.wheelDesign.create({
        data: {
          name: input.name,
          colorMode: input.colorMode,
          primaryColor: input.primaryColor || null,
          secondaryColor: input.secondaryColor || null,
          segments: input.segments,
          numberOfSegments: input.numberOfSegments,
          centerLogoUrl: input.centerLogoUrl,
          centerLogoSize: input.centerLogoSize,
          backgroundColor: input.backgroundColor,
          segmentBorderWidth: input.segmentBorderWidth,
          segmentBorderColor: input.segmentBorderColor,
          showSegmentText: input.showSegmentText,
          textSize: input.textSize,
          textFont: input.textFont,
          textRotation: input.textRotation,
          centerCircleColor: input.centerCircleColor,
          centerCircleSize: input.centerCircleSize,
          pointerColor: input.pointerColor,
          pointerStyle: input.pointerStyle,
          animationSpeed: input.animationSpeed,
          spinDuration: input.spinDuration,
          enableSound: input.enableSound,
          isDefault: input.isDefault || false,
          userId: ctx.userId,
        },
      });

      return design;
    } catch (_error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur lors de la sauvegarde du design',
      });
    }
  }),

  /**
   * Mettre à jour un design existant
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: WheelDesignConfigSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'utilisateur est bien le propriétaire
      const existing = await ctx.prisma.wheelDesign.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Design non trouvé',
        });
      }

      if (existing.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'êtes pas autorisé à modifier ce design",
        });
      }

      try {
        const updated = await ctx.prisma.wheelDesign.update({
          where: { id: input.id },
          data: {
            ...(input.data.name && { name: input.data.name }),
            ...(input.data.colorMode && { colorMode: input.data.colorMode }),
            ...(input.data.primaryColor !== undefined && { primaryColor: input.data.primaryColor }),
            ...(input.data.secondaryColor !== undefined && {
              secondaryColor: input.data.secondaryColor,
            }),
            ...(input.data.segments && { segments: input.data.segments }),
            ...(input.data.numberOfSegments && {
              numberOfSegments: input.data.numberOfSegments,
            }),
            ...(input.data.centerLogoUrl !== undefined && {
              centerLogoUrl: input.data.centerLogoUrl,
            }),
            ...(input.data.centerLogoSize && { centerLogoSize: input.data.centerLogoSize }),
            ...(input.data.backgroundColor && { backgroundColor: input.data.backgroundColor }),
            ...(input.data.segmentBorderWidth && {
              segmentBorderWidth: input.data.segmentBorderWidth,
            }),
            ...(input.data.segmentBorderColor && {
              segmentBorderColor: input.data.segmentBorderColor,
            }),
            ...(input.data.showSegmentText !== undefined && {
              showSegmentText: input.data.showSegmentText,
            }),
            ...(input.data.textSize && { textSize: input.data.textSize }),
            ...(input.data.textFont && { textFont: input.data.textFont }),
            ...(input.data.textRotation !== undefined && {
              textRotation: input.data.textRotation,
            }),
            ...(input.data.centerCircleColor && {
              centerCircleColor: input.data.centerCircleColor,
            }),
            ...(input.data.centerCircleSize && {
              centerCircleSize: input.data.centerCircleSize,
            }),
            ...(input.data.pointerColor && { pointerColor: input.data.pointerColor }),
            ...(input.data.pointerStyle && { pointerStyle: input.data.pointerStyle }),
            ...(input.data.animationSpeed && { animationSpeed: input.data.animationSpeed }),
            ...(input.data.spinDuration && { spinDuration: input.data.spinDuration }),
            ...(input.data.enableSound !== undefined && { enableSound: input.data.enableSound }),
            ...(input.data.isDefault !== undefined && { isDefault: input.data.isDefault }),
          },
        });

        return updated;
      } catch (_error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la mise à jour du design',
        });
      }
    }),

  /**
   * Récupérer tous les designs de l'utilisateur
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const designs = await ctx.prisma.wheelDesign.findMany({
        where: { userId: ctx.userId },
        orderBy: { createdAt: 'desc' },
      });

      return designs;
    } catch (_error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur lors de la récupération des designs',
      });
    }
  }),

  /**
   * Récupérer un design par son ID
   */
  getById: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    try {
      const design = await ctx.prisma.wheelDesign.findUnique({
        where: { id: input },
      });

      if (!design) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Design non trouvé',
        });
      }

      // Vérifier que l'utilisateur est bien le propriétaire
      if (design.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'êtes pas autorisé à accéder à ce design",
        });
      }

      return design;
    } catch (_error) {
      if (_error instanceof TRPCError) {
        throw _error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur lors de la récupération du design',
      });
    }
  }),

  /**
   * Supprimer un design
   */
  delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    // Vérifier que l'utilisateur est bien le propriétaire
    const existing = await ctx.prisma.wheelDesign.findUnique({
      where: { id: input },
      select: { userId: true },
    });

    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Design non trouvé',
      });
    }

    if (existing.userId !== ctx.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: "Vous n'êtes pas autorisé à supprimer ce design",
      });
    }

    try {
      await ctx.prisma.wheelDesign.delete({
        where: { id: input },
      });

      return { success: true };
    } catch (_error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur lors de la suppression du design',
      });
    }
  }),
});
