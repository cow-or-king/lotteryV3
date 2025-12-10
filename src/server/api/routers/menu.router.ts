/**
 * Menu Router - gestion des permissions de menus
 * IMPORTANT: Route protégée SUPER_ADMIN uniquement
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { DEFAULT_MENU_CONFIG } from '@/lib/rbac/menuConfig';

// Schema pour la sauvegarde des permissions
const menuPermissionSchema = z.object({
  menuId: z.string(),
  label: z.string(),
  superAdminVisible: z.boolean(),
  adminVisible: z.boolean(),
  userVisible: z.boolean(),
  displayOrder: z.number(),
});

export const menuRouter = createTRPCRouter({
  /**
   * Récupère toutes les permissions de menus
   */
  getPermissions: protectedProcedure.query(async ({ ctx }) => {
    // Vérifier que l'utilisateur est SUPER_ADMIN
    if (ctx.user.role !== 'SUPER_ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Seuls les SUPER_ADMIN peuvent accéder aux permissions de menus',
      });
    }

    const permissions = await ctx.prisma.menuPermission.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return permissions;
  }),

  /**
   * Sauvegarde les permissions de menus (batch update)
   */
  savePermissions: protectedProcedure
    .input(z.array(menuPermissionSchema))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'utilisateur est SUPER_ADMIN
      if (ctx.user.role !== 'SUPER_ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls les SUPER_ADMIN peuvent modifier les permissions de menus',
        });
      }

      // Valider que les routes SUPER_ADMIN ne peuvent pas être activées pour ADMIN/USER
      for (const permission of input) {
        const menuConfig = DEFAULT_MENU_CONFIG.find((m) => m.id === permission.menuId);
        if (menuConfig && menuConfig.targetRole === 'SUPER_ADMIN') {
          // Routes super-admin ne peuvent JAMAIS être accessibles aux ADMIN/USER
          if (permission.adminVisible || permission.userVisible) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Le menu "${permission.label}" est réservé au SUPER_ADMIN et ne peut pas être partagé avec ADMIN ou USER.`,
            });
          }
        }
      }

      // Utiliser une transaction pour garantir la cohérence
      await ctx.prisma.$transaction(
        input.map((permission) =>
          ctx.prisma.menuPermission.upsert({
            where: { menuId: permission.menuId },
            update: {
              label: permission.label,
              superAdminVisible: permission.superAdminVisible,
              adminVisible: permission.adminVisible,
              userVisible: permission.userVisible,
              displayOrder: permission.displayOrder,
              updatedAt: new Date(),
            },
            create: {
              menuId: permission.menuId,
              label: permission.label,
              superAdminVisible: permission.superAdminVisible,
              adminVisible: permission.adminVisible,
              userVisible: permission.userVisible,
              displayOrder: permission.displayOrder,
            },
          }),
        ),
      );

      return { success: true, message: 'Permissions sauvegardées avec succès' };
    }),

  /**
   * Réinitialise les permissions aux valeurs par défaut
   */
  resetPermissions: protectedProcedure.mutation(async ({ ctx }) => {
    // Vérifier que l'utilisateur est SUPER_ADMIN
    if (ctx.user.role !== 'SUPER_ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Seuls les SUPER_ADMIN peuvent réinitialiser les permissions',
      });
    }

    // Supprimer toutes les permissions existantes
    await ctx.prisma.menuPermission.deleteMany({});

    return { success: true, message: 'Permissions réinitialisées' };
  }),
});
