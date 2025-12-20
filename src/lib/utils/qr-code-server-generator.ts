/**
 * QR Code Server Generator
 * Service pour générer automatiquement un QR Code par défaut lors de la création d'un Store
 * IMPORTANT: ZERO any types
 * Ce service utilise la librairie 'qrcode' native Node.js (server-side)
 */

import * as QRCode from 'qrcode';
import { prisma } from '@/infrastructure/database/prisma-client';
import { logger } from '@/lib/utils/logger';

/**
 * Interface pour les paramètres de génération d'un QR Code par défaut
 */
interface GenerateDefaultQRCodeParams {
  storeId: string;
  storeName: string;
  storeSlug: string;
  userId: string;
}

/**
 * Interface pour le résultat de la génération
 */
interface GenerateDefaultQRCodeResult {
  success: boolean;
  qrCodeId?: string;
  error?: string;
}

/**
 * Génère un QR Code SVG par défaut pour un Store
 * - URL cible: ${NEXT_PUBLIC_APP_URL}/c/{shortCode} (utilise un shortCode unique)
 * - Format: SVG
 * - Pas de logo
 * - Configuration par défaut (noir & blanc)
 *
 * @param params - Paramètres de génération
 * @returns Promise avec le résultat de la génération
 */
export async function generateDefaultQRCodeForStore(
  params: GenerateDefaultQRCodeParams,
): Promise<GenerateDefaultQRCodeResult> {
  const { storeId, storeName, storeSlug, userId } = params;

  try {
    // Générer un shortCode unique basé sur le slug du store + timestamp
    const timestamp = Date.now().toString(36); // Base 36 pour raccourcir
    const shortCode = `${storeSlug}-${timestamp}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // Construire l'URL cible avec le shortCode (permanent)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const targetUrl = `${baseUrl}/c/${shortCode}`;

    logger.info(`Generating default QR Code for store ${storeId}`, {
      storeName,
      storeId,
      shortCode,
      targetUrl,
    });

    // Générer le SVG avec qrcode
    await QRCode.toString(targetUrl, {
      type: 'svg',
      errorCorrectionLevel: 'M', // 15% correction
      margin: 1,
      width: 512,
      color: {
        dark: '#000000', // Couleur du QR Code (noir)
        light: '#FFFFFF', // Couleur de fond (blanc)
      },
    });

    // Créer l'enregistrement QRCode dans la base de données
    const qrCode = await prisma.qRCode.create({
      data: {
        name: `QR Code par défaut - ${storeName}`,
        url: targetUrl,
        shortCode, // IMPORTANT: shortCode unique pour identifier le store
        type: 'STATIC',
        style: 'SQUARE',
        animation: 'NONE',
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        logoUrl: null, // Pas de logo pour l'instant
        logoStoragePath: null,
        logoSize: null,
        size: 512,
        errorCorrectionLevel: 'M',
        storeId,
        campaignId: null,
        createdBy: userId,
      },
    });

    logger.info(`Default QR Code created successfully for store ${storeId}`, {
      qrCodeId: qrCode.id,
      qrCodeName: qrCode.name,
    });

    return {
      success: true,
      qrCodeId: qrCode.id,
    };
  } catch (error) {
    logger.error(`Failed to generate default QR Code for store ${storeId}`, {
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
 * Met à jour le Store avec le defaultQrCodeId
 *
 * @param storeId - ID du Store
 * @param qrCodeId - ID du QR Code généré
 * @returns Promise avec le résultat de la mise à jour
 */
export async function linkDefaultQRCodeToStore(
  storeId: string,
  qrCodeId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.store.update({
      where: { id: storeId },
      data: {
        defaultQrCodeId: qrCodeId,
        qrCodeCustomized: false, // Pas encore personnalisé
      },
    });

    logger.info(`Default QR Code linked to store ${storeId}`, {
      qrCodeId,
    });

    return { success: true };
  } catch (error) {
    logger.error(`Failed to link QR Code to store ${storeId}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Génère un QR Code par défaut et le lie au Store
 * Fonction complète qui combine génération + liaison
 *
 * @param params - Paramètres de génération
 * @returns Promise avec le résultat complet
 */
export async function generateAndLinkDefaultQRCode(
  params: GenerateDefaultQRCodeParams,
): Promise<GenerateDefaultQRCodeResult> {
  try {
    // 1. Générer le QR Code
    const generateResult = await generateDefaultQRCodeForStore(params);

    if (!generateResult.success || !generateResult.qrCodeId) {
      return generateResult;
    }

    // 2. Lier le QR Code au Store
    const linkResult = await linkDefaultQRCodeToStore(params.storeId, generateResult.qrCodeId);

    if (!linkResult.success) {
      // La génération a réussi mais la liaison a échoué
      // On garde quand même le QR Code créé
      logger.warn(`QR Code generated but linking failed for store ${params.storeId}`, {
        qrCodeId: generateResult.qrCodeId,
        error: linkResult.error,
      });
    }

    return {
      success: true,
      qrCodeId: generateResult.qrCodeId,
    };
  } catch (error) {
    logger.error(`Failed to generate and link default QR Code for store ${params.storeId}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
