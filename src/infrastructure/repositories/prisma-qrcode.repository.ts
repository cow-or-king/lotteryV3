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
   * Met à jour l'URL du QR Code pour pointer vers une campagne
   * L'URL pointera vers /campaign/[campaignId]/play
   */
  async updateCampaignUrl(qrCodeId: string, campaignId: string): Promise<void> {
    const campaignUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/campaign/${campaignId}/play`;

    await prisma.qRCode.update({
      where: { id: qrCodeId },
      data: {
        url: campaignUrl,
        campaignId, // Associer le QR Code à la campagne
        updatedAt: new Date(),
      },
    });
  }
}
