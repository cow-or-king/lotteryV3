/**
 * Prisma QRCode Repository
 * Implémente l'interface QRCode Repository pour la mise à jour du QR Code
 * IMPORTANT: ZERO any types
 */

import { prisma } from '@/infrastructure/database/prisma-client';

export interface QRCodeRepository {
  updateCampaignUrl(qrCodeId: string, campaignId: string): Promise<void>;
}

export class PrismaQRCodeRepository implements QRCodeRepository {
  /**
   * Met à jour le QR Code pour l'associer à une campagne
   * L'URL reste /c/{shortCode} et ne change jamais
   * Seul le campaignId est mis à jour pour tracking
   */
  async updateCampaignUrl(qrCodeId: string, campaignId: string): Promise<void> {
    // L'URL du QR code ne change pas, elle pointe toujours vers /c/{shortCode}
    // On met juste à jour le campaignId pour le tracking
    await prisma.qRCode.update({
      where: { id: qrCodeId },
      data: {
        campaignId, // Associer le QR Code à la campagne active
        updatedAt: new Date(),
      },
    });
  }
}
