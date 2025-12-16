/**
 * Game Design Router
 * Routes tRPC pour la création de designs de jeux
 */

import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { slotMachineDesignSchema, wheelMiniDesignSchema } from './game-schemas';

export const gameDesignRouter = createTRPCRouter({
  /**
   * Sauvegarder un design de machine à sous
   */
  saveSlotMachineDesign: protectedProcedure
    .input(slotMachineDesignSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const game = await ctx.prisma.game.create({
        data: {
          name: input.name,
          type: 'SLOT_MACHINE',
          config: input.design as Parameters<typeof ctx.prisma.game.create>[0]['data']['config'],
          primaryColor: input.design.backgroundColor,
          secondaryColor: input.design.reelBorderColor,
          vibrationEnabled: true,
          isActive: true,
          createdBy: userId,
        },
      });

      return game;
    }),

  /**
   * Sauvegarder un design de roue rapide (wheel mini)
   */
  saveWheelMiniDesign: protectedProcedure
    .input(wheelMiniDesignSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const game = await ctx.prisma.game.create({
        data: {
          name: input.name,
          type: 'WHEEL_MINI',
          config: input.design as Parameters<typeof ctx.prisma.game.create>[0]['data']['config'],
          primaryColor: input.design.colors[0] || '#8B5CF6',
          secondaryColor: input.design.colors[1] || '#EC4899',
          vibrationEnabled: true,
          isActive: true,
          createdBy: userId,
        },
      });

      return game;
    }),
});
