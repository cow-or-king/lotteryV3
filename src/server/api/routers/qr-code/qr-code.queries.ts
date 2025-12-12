/**
 * QR Code Queries
 * Toutes les queries (lecture seule) pour les QR codes
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';
import type { QRCodeType, QRCodeStyle, QRCodeAnimation } from '@/lib/types/qr-code.types';

export const qrCodeQueriesRouter = createTRPCRouter({
  /**
   * Liste tous les QR codes de l'utilisateur connecté
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const qrCodes = await prisma.qRCode.findMany({
      where: {
        createdBy: ctx.user.id,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map to include store name and campaign name
    return qrCodes.map((qrCode) => ({
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
      storeName: qrCode.store?.name || null,
      campaignId: qrCode.campaignId,
      campaignName: null, // TODO: Add when campaign model is ready
      scansCount: qrCode.scanCount,
      createdAt: qrCode.createdAt,
      updatedAt: qrCode.updatedAt,
      createdBy: qrCode.createdBy,
    }));
  }),

  /**
   * Récupère un QR code par son ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const qrCode = await prisma.qRCode.findUnique({
        where: {
          id: input.id,
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!qrCode) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'QR code non trouvé',
        });
      }

      // Verify ownership
      if (qrCode.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'avez pas accès à ce QR code",
        });
      }

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
        storeName: qrCode.store?.name || null,
        campaignId: qrCode.campaignId,
        scansCount: qrCode.scanCount,
        createdAt: qrCode.createdAt,
        updatedAt: qrCode.updatedAt,
      };
    }),

  /**
   * Récupère les statistiques détaillées d'un QR code
   */
  getStats: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        period: z.enum(['7d', '30d', '90d', 'all']).default('30d'),
        date: z.string().optional(), // Date spécifique pour les stats horaires (format ISO YYYY-MM-DD)
      }),
    )
    .query(async ({ ctx, input }) => {
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

      // Calculer la date de début selon la période
      const now = new Date();
      const startDate = new Date();

      switch (input.period) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case 'all':
          startDate.setFullYear(2000); // Date très ancienne
          break;
      }

      // Récupérer tous les scans de la période
      const scans = await prisma.qRCodeScan.findMany({
        where: {
          qrCodeId: input.id,
          scannedAt: {
            gte: startDate,
          },
        },
        orderBy: {
          scannedAt: 'asc',
        },
      });

      // Grouper par jour
      const scansByDay: Record<string, number> = {};
      scans.forEach((scan) => {
        const dateString = scan.scannedAt.toISOString().split('T')[0];
        if (dateString) {
          scansByDay[dateString] = (scansByDay[dateString] || 0) + 1;
        }
      });

      // Grouper par heure de la journée (0-23)
      // Si une date spécifique est fournie, filtrer uniquement les scans de ce jour
      const scansByHour: Record<number, number> = {};
      const scansToAnalyze = input.date
        ? scans.filter((scan) => {
            const scanDate = scan.scannedAt.toISOString().split('T')[0];
            return scanDate === input.date;
          })
        : scans;

      scansToAnalyze.forEach((scan) => {
        const hour = scan.scannedAt.getHours();
        scansByHour[hour] = (scansByHour[hour] || 0) + 1;
      });

      // Calculer les stats rapides
      const today = now.toISOString().split('T')[0];
      const scansToday = today ? scansByDay[today] || 0 : 0;

      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      const scansThisWeek = scans.filter((scan) => scan.scannedAt >= weekAgo).length;

      const monthAgo = new Date();
      monthAgo.setDate(now.getDate() - 30);
      const scansThisMonth = scans.filter((scan) => scan.scannedAt >= monthAgo).length;

      const lastScan = scans.length > 0 ? scans[scans.length - 1]?.scannedAt : null;

      return {
        totalScans: qrCode.scanCount,
        scansToday,
        scansThisWeek,
        scansThisMonth,
        lastScan,
        scansByDay: Object.entries(scansByDay).map(([date, count]) => ({
          date,
          count,
        })),
        scansByHour: Object.entries(scansByHour)
          .map(([hour, count]) => ({
            hour: parseInt(hour),
            count,
          }))
          .sort((a, b) => a.hour - b.hour),
      };
    }),

  /**
   * Enregistre un scan de QR code (PUBLIC - pas d'auth requise)
   * IMPORTANT: Cette mutation est appelée depuis la page publique /qr/[id]
   */
  scan: publicProcedure
    .input(
      z.object({
        qrCodeId: z.string(),
        userAgent: z.string().optional(),
        referrer: z.string().nullable().optional(),
        language: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Récupérer le QR code par ID ou shortCode
      let qrCode = await prisma.qRCode.findUnique({
        where: { id: input.qrCodeId },
      });

      // Si pas trouvé par ID, essayer par shortCode
      if (!qrCode) {
        qrCode = await prisma.qRCode.findUnique({
          where: { shortCode: input.qrCodeId },
        });
      }

      if (!qrCode) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'QR code invalide ou expiré',
        });
      }

      // Vérifier si le QR code est expiré
      if (qrCode.expiresAt && qrCode.expiresAt < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce QR code a expiré',
        });
      }

      // TODO: Parser userAgent pour extraire deviceType, os, browser
      // TODO: Géolocalisation IP pour country/city (Phase 3)

      // Mettre à jour les compteurs du QR code + enregistrer le scan détaillé
      await prisma.$transaction([
        prisma.qRCode.update({
          where: { id: input.qrCodeId },
          data: {
            scanCount: {
              increment: 1,
            },
            lastScannedAt: new Date(),
          },
        }),
        prisma.qRCodeScan.create({
          data: {
            qrCodeId: input.qrCodeId,
            userAgent: input.userAgent,
            referrer: input.referrer,
            language: input.language,
            // TODO Phase 2: Extraire deviceType, os, browser depuis userAgent
            // TODO Phase 3: Ajouter ipAddress, country, city depuis IP
          },
        }),
      ]);

      // Retourner l'URL de redirection
      return {
        redirectUrl: qrCode.url,
        scanCount: qrCode.scanCount + 1,
      };
    }),
});
