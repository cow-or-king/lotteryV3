/**
 * QR Code Customizer (Server-side)
 * Service pour personnaliser un QR Code par défaut de Store
 * Génère SVG + PNG HD et upload vers Supabase Storage
 * IMPORTANT: ZERO any types
 */

import * as QRCode from 'qrcode';
import { prisma } from '@/infrastructure/database/prisma-client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import type { QRCodeStyle, ErrorCorrectionLevel, LogoSize } from '@/lib/types/qr-code.types';

/**
 * Interface pour les paramètres de personnalisation
 */
interface CustomizeQRCodeParams {
  qrCodeId: string;
  style: QRCodeStyle;
  foregroundColor: string;
  backgroundColor: string;
  logoSize: LogoSize | null;
  errorCorrectionLevel: ErrorCorrectionLevel;
  userId: string;
}

/**
 * Interface pour le résultat
 */
interface CustomizeQRCodeResult {
  success: boolean;
  svgUrl?: string;
  pngUrl?: string;
  customizedAt?: Date;
  error?: string;
}

/**
 * Conversion style enum vers QRCode options
 */
function getQRCodeMargin(style: QRCodeStyle): number {
  // CLASSY style a besoin de plus de margin pour les dégradés
  return style === 'CLASSY' ? 2 : 1;
}

/**
 * Personnalise un QR Code par défaut de Store
 * - Vérifie que le QR Code n'est pas déjà personnalisé
 * - Génère SVG + PNG HD (2048x2048)
 * - Upload vers Supabase Storage
 * - Met à jour QRCode + Store (verrouillage)
 *
 * @param params - Paramètres de personnalisation
 * @returns Promise avec le résultat
 */
export async function customizeStoreQRCode(
  params: CustomizeQRCodeParams,
): Promise<CustomizeQRCodeResult> {
  const {
    qrCodeId,
    style,
    foregroundColor,
    backgroundColor,
    logoSize,
    errorCorrectionLevel,
    userId,
  } = params;

  try {
    // 1. Récupérer le QR Code + Store
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId },
      include: {
        storeDefault: {
          include: {
            brand: {
              select: {
                ownerId: true,
                logoUrl: true,
                logoStoragePath: true,
              },
            },
          },
        },
      },
    });

    if (!qrCode) {
      return { success: false, error: 'QR Code non trouvé' };
    }

    // 2. Vérifier ownership
    if (qrCode.createdBy !== userId) {
      return { success: false, error: "Vous n'avez pas accès à ce QR Code" };
    }

    // 3. Vérifier que le Store existe et n'est pas déjà personnalisé
    if (!qrCode.storeDefault) {
      return { success: false, error: "Ce QR Code n'est pas le QR Code par défaut d'un Store" };
    }

    if (qrCode.storeDefault.qrCodeCustomized) {
      return {
        success: false,
        error: `QR Code déjà personnalisé le ${qrCode.storeDefault.qrCodeCustomizedAt?.toLocaleDateString('fr-FR')}`,
      };
    }

    // 4. Vérifier ownership du Store
    if (qrCode.storeDefault.brand.ownerId !== userId) {
      return { success: false, error: "Vous n'avez pas accès à ce commerce" };
    }

    const storeId = qrCode.storeDefault.id;
    const targetUrl = qrCode.url;

    logger.info(`Customizing QR Code ${qrCodeId} for store ${storeId}`, {
      style,
      foregroundColor,
      backgroundColor,
      logoSize,
      errorCorrectionLevel,
    });

    // 5. Récupérer le logo du Store si logoSize est défini
    let logoUrl: string | null = null;
    let logoSizePixels: number | null = null;

    if (logoSize && qrCode.storeDefault?.brand.logoUrl) {
      logoUrl = qrCode.storeDefault.brand.logoUrl;
      // Import dynamique pour éviter les erreurs TypeScript
      const { LOGO_SIZE_TO_PIXELS } = await import('@/lib/types/qr-code.types');
      logoSizePixels = LOGO_SIZE_TO_PIXELS[logoSize];
    }

    // 6. Générer SVG (vectoriel pour impression)
    const svgData = await generateQRCodeSVG({
      url: targetUrl,
      foregroundColor,
      backgroundColor,
      errorCorrectionLevel,
      margin: getQRCodeMargin(style),
    });

    // 7. Générer PNG HD (2048x2048 pour haute résolution)
    const pngBuffer = await generateQRCodePNG({
      url: targetUrl,
      foregroundColor,
      backgroundColor,
      errorCorrectionLevel,
      size: 2048,
      margin: getQRCodeMargin(style),
    });

    // 8. Upload vers Supabase Storage
    const timestamp = Date.now();
    const svgPath = `qr-codes/${qrCodeId}/custom-${timestamp}.svg`;
    const pngPath = `qr-codes/${qrCodeId}/custom-${timestamp}.png`;

    // Upload SVG
    const { error: svgUploadError } = await supabaseAdmin.storage
      .from('qr-codes')
      .upload(svgPath, Buffer.from(svgData), {
        contentType: 'image/svg+xml',
        upsert: false,
      });

    if (svgUploadError) {
      logger.error('SVG upload error:', svgUploadError);
      return { success: false, error: 'Échec upload SVG' };
    }

    // Upload PNG
    const { error: pngUploadError } = await supabaseAdmin.storage
      .from('qr-codes')
      .upload(pngPath, pngBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (pngUploadError) {
      logger.error('PNG upload error:', pngUploadError);
      // Cleanup SVG
      await supabaseAdmin.storage.from('qr-codes').remove([svgPath]);
      return { success: false, error: 'Échec upload PNG' };
    }

    // 9. Récupérer les URLs publiques
    const { data: svgUrlData } = supabaseAdmin.storage.from('qr-codes').getPublicUrl(svgPath);
    const { data: pngUrlData } = supabaseAdmin.storage.from('qr-codes').getPublicUrl(pngPath);

    const customizedAt = new Date();

    // 10. Mettre à jour le QRCode + Store dans une transaction
    await prisma.$transaction([
      // Update QRCode
      prisma.qRCode.update({
        where: { id: qrCodeId },
        data: {
          style,
          foregroundColor,
          backgroundColor,
          logoSize: logoSizePixels,
          errorCorrectionLevel,
          logoUrl, // Ajouter le logo du Store si défini
          logoStoragePath: qrCode.storeDefault?.brand.logoStoragePath, // Référencer le storage path
        },
      }),
      // Update Store (verrouillage)
      prisma.store.update({
        where: { id: storeId },
        data: {
          qrCodeCustomized: true,
          qrCodeCustomizedAt: customizedAt,
        },
      }),
    ]);

    logger.info(`QR Code ${qrCodeId} customized successfully`, {
      svgUrl: svgUrlData.publicUrl,
      pngUrl: pngUrlData.publicUrl,
    });

    return {
      success: true,
      svgUrl: svgUrlData.publicUrl,
      pngUrl: pngUrlData.publicUrl,
      customizedAt,
    };
  } catch (error) {
    logger.error(`Failed to customize QR Code ${qrCodeId}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Génère un QR Code SVG (vectoriel)
 */
async function generateQRCodeSVG(options: {
  url: string;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
}): Promise<string> {
  const { url, foregroundColor, backgroundColor, errorCorrectionLevel, margin } = options;

  const svg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
    margin,
    width: 2048, // Haute résolution pour impression
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  });

  return svg;
}

/**
 * Génère un QR Code PNG (raster HD)
 */
async function generateQRCodePNG(options: {
  url: string;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  size: number;
  margin: number;
}): Promise<Buffer> {
  const { url, foregroundColor, backgroundColor, errorCorrectionLevel, size, margin } = options;

  const buffer = await QRCode.toBuffer(url, {
    type: 'png',
    errorCorrectionLevel: errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
    margin,
    width: size,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  });

  return buffer;
}

/**
 * Génère un signed URL pour télécharger un QR Code
 * Expire dans 1 heure
 */
export async function generateQRCodeDownloadUrl(
  qrCodeId: string,
  format: 'SVG' | 'PNG',
  userId: string,
): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
  try {
    // 1. Vérifier ownership
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId },
      include: {
        storeDefault: {
          select: {
            qrCodeCustomized: true,
          },
        },
      },
    });

    if (!qrCode) {
      return { success: false, error: 'QR Code non trouvé' };
    }

    if (qrCode.createdBy !== userId) {
      return { success: false, error: "Vous n'avez pas accès à ce QR Code" };
    }

    // 2. Vérifier que le QR Code est personnalisé
    if (!qrCode.storeDefault?.qrCodeCustomized) {
      return { success: false, error: 'QR Code non personnalisé' };
    }

    // 3. Chercher le fichier le plus récent dans Supabase
    const extension = format === 'SVG' ? '.svg' : '.png';

    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('qr-codes')
      .list(`qr-codes/${qrCodeId}`, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (listError || !files || files.length === 0) {
      return { success: false, error: 'Fichier QR Code non trouvé' };
    }

    // Trouver le fichier custom le plus récent avec la bonne extension
    const targetFile = files.find(
      (file) => file.name.startsWith('custom') && file.name.endsWith(extension),
    );

    if (!targetFile) {
      return { success: false, error: `Fichier ${format} non trouvé` };
    }

    const filePath = `qr-codes/${qrCodeId}/${targetFile.name}`;

    // 4. Générer signed URL (expire dans 1h)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('qr-codes')
      .createSignedUrl(filePath, 3600); // 3600 secondes = 1h

    if (signedUrlError || !signedUrlData) {
      logger.error('Failed to generate signed URL:', signedUrlError);
      return { success: false, error: 'Échec génération URL signée' };
    }

    return {
      success: true,
      downloadUrl: signedUrlData.signedUrl,
    };
  } catch (error) {
    logger.error('Error generating download URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
