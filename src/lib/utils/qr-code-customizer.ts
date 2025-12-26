/**
 * QR Code Customizer (Server-side)
 * Service pour personnaliser un QR Code par défaut de Store
 * Génère SVG + PNG HD et upload vers Supabase Storage
 * IMPORTANT: ZERO any types
 */

import { prisma } from '@/infrastructure/database/prisma-client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import type { QRCodeStyle, ErrorCorrectionLevel, LogoSize } from '@/lib/types/qr-code.types';
import { generateQRCodeSVG, generateQRCodePNG } from './qr-code-style-builder';
import { getQRCodeMargin } from './qr-code-shape-builder';

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
 * Interface pour le QR Code récupéré
 */
interface FetchedQRCode {
  id: string;
  url: string;
  createdBy: string;
  storeDefault: {
    id: string;
    qrCodeCustomized: boolean;
    qrCodeCustomizedAt: Date | null;
    brand: {
      ownerId: string;
      logoUrl: string | null;
      logoStoragePath: string | null;
    };
  } | null;
}

/**
 * Interface pour les URLs uploadées
 */
interface UploadedUrls {
  svgUrl: string;
  pngUrl: string;
}

/**
 * Valide les permissions et l'état du QR Code
 */
function validateQRCodeAccess(
  qrCode: FetchedQRCode | null,
  userId: string,
): CustomizeQRCodeResult | null {
  if (!qrCode) {
    return { success: false, error: 'QR Code non trouvé' };
  }

  if (qrCode.createdBy !== userId) {
    return { success: false, error: "Vous n'avez pas accès à ce QR Code" };
  }

  if (!qrCode.storeDefault) {
    return { success: false, error: "Ce QR Code n'est pas le QR Code par défaut d'un Store" };
  }

  if (qrCode.storeDefault.qrCodeCustomized) {
    return {
      success: false,
      error: `QR Code déjà personnalisé le ${qrCode.storeDefault.qrCodeCustomizedAt?.toLocaleDateString('fr-FR')}`,
    };
  }

  if (qrCode.storeDefault.brand.ownerId !== userId) {
    return { success: false, error: "Vous n'avez pas accès à ce commerce" };
  }

  return null; // No validation error
}

/**
 * Récupère le logo et sa taille en pixels si disponible
 */
async function getLogoDetails(
  logoSize: LogoSize | null,
  brandLogoUrl: string | null,
): Promise<{ logoUrl: string | null; logoSizePixels: number | null }> {
  if (!logoSize || !brandLogoUrl) {
    return { logoUrl: null, logoSizePixels: null };
  }

  const { LOGO_SIZE_TO_PIXELS } = await import('@/lib/types/qr-code.types');
  return {
    logoUrl: brandLogoUrl,
    logoSizePixels: LOGO_SIZE_TO_PIXELS[logoSize],
  };
}

/**
 * Upload un fichier vers Supabase Storage
 */
async function uploadToStorage(
  path: string,
  data: Buffer,
  contentType: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseAdmin.storage.from('qr-codes').upload(path, data, {
    contentType,
    upsert: false,
  });

  if (error) {
    logger.error(`Upload error for ${path}:`, error);
    return { success: false, error: `Échec upload ${contentType}` };
  }

  return { success: true };
}

/**
 * Upload SVG et PNG vers Supabase Storage
 */
async function uploadQRCodeFiles(
  qrCodeId: string,
  svgData: string,
  pngBuffer: Buffer,
): Promise<{ success: boolean; urls?: UploadedUrls; error?: string }> {
  const timestamp = Date.now();
  const svgPath = `qr-codes/${qrCodeId}/custom-${timestamp}.svg`;
  const pngPath = `qr-codes/${qrCodeId}/custom-${timestamp}.png`;

  // Upload SVG
  const svgResult = await uploadToStorage(svgPath, Buffer.from(svgData), 'image/svg+xml');
  if (!svgResult.success) {
    return { success: false, error: svgResult.error };
  }

  // Upload PNG
  const pngResult = await uploadToStorage(pngPath, pngBuffer, 'image/png');
  if (!pngResult.success) {
    // Cleanup SVG
    await supabaseAdmin.storage.from('qr-codes').remove([svgPath]);
    return { success: false, error: pngResult.error };
  }

  // Get public URLs
  const { data: svgUrlData } = supabaseAdmin.storage.from('qr-codes').getPublicUrl(svgPath);
  const { data: pngUrlData } = supabaseAdmin.storage.from('qr-codes').getPublicUrl(pngPath);

  return {
    success: true,
    urls: {
      svgUrl: svgUrlData.publicUrl,
      pngUrl: pngUrlData.publicUrl,
    },
  };
}

/**
 * Met à jour le QR Code et le Store dans une transaction
 */
async function updateQRCodeAndStore(
  qrCodeId: string,
  storeId: string,
  params: {
    style: QRCodeStyle;
    foregroundColor: string;
    backgroundColor: string;
    logoSize: number | null;
    errorCorrectionLevel: ErrorCorrectionLevel;
    logoUrl: string | null;
    logoStoragePath: string | null;
  },
  customizedAt: Date,
): Promise<void> {
  await prisma.$transaction([
    prisma.qRCode.update({
      where: { id: qrCodeId },
      data: {
        style: params.style,
        foregroundColor: params.foregroundColor,
        backgroundColor: params.backgroundColor,
        logoSize: params.logoSize,
        errorCorrectionLevel: params.errorCorrectionLevel,
        logoUrl: params.logoUrl,
        logoStoragePath: params.logoStoragePath,
      },
    }),
    prisma.store.update({
      where: { id: storeId },
      data: {
        qrCodeCustomized: true,
        qrCodeCustomizedAt: customizedAt,
      },
    }),
  ]);
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

    // 2. Valider les permissions et l'état
    const validationError = validateQRCodeAccess(qrCode as FetchedQRCode | null, userId);
    if (validationError) {
      return validationError;
    }

    // After validation, qrCode and storeDefault are guaranteed to exist
    if (!qrCode || !qrCode.storeDefault) {
      return { success: false, error: 'QR Code ou Store invalide' };
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

    // 3. Récupérer le logo du Store si disponible
    const { logoUrl, logoSizePixels } = await getLogoDetails(
      logoSize,
      qrCode.storeDefault.brand.logoUrl,
    );

    // 4. Générer SVG (vectoriel pour impression)
    const svgData = await generateQRCodeSVG({
      url: targetUrl,
      foregroundColor,
      backgroundColor,
      errorCorrectionLevel,
      margin: getQRCodeMargin(style),
      width: 2048,
    });

    // 5. Générer PNG HD (2048x2048 pour haute résolution)
    const pngBuffer = await generateQRCodePNG({
      url: targetUrl,
      foregroundColor,
      backgroundColor,
      errorCorrectionLevel,
      margin: getQRCodeMargin(style),
      width: 2048,
    });

    // 6. Upload vers Supabase Storage
    const uploadResult = await uploadQRCodeFiles(qrCodeId, svgData, pngBuffer);
    if (!uploadResult.success || !uploadResult.urls) {
      return { success: false, error: uploadResult.error };
    }

    const customizedAt = new Date();

    // 7. Mettre à jour le QRCode + Store dans une transaction
    await updateQRCodeAndStore(
      qrCodeId,
      storeId,
      {
        style,
        foregroundColor,
        backgroundColor,
        logoSize: logoSizePixels,
        errorCorrectionLevel,
        logoUrl,
        logoStoragePath: qrCode.storeDefault.brand.logoStoragePath,
      },
      customizedAt,
    );

    logger.info(`QR Code ${qrCodeId} customized successfully`, uploadResult.urls);

    return {
      success: true,
      svgUrl: uploadResult.urls.svgUrl,
      pngUrl: uploadResult.urls.pngUrl,
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
