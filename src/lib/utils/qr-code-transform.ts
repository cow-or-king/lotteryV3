/**
 * QR Code Data Transformation Utilities
 * Helpers pour transformer les données de QR codes
 */

import type { QRCodeListItem } from '@/lib/types/qr-code.types';

/**
 * Type pour les données brutes du serveur tRPC
 */
type QRCodeServerData = {
  id: string;
  name: string;
  url: string;
  type: string;
  style: string;
  animation: string | null;
  foregroundColor: string;
  backgroundColor: string;
  logoUrl: string | null;
  logoStoragePath: string | null;
  logoSize: number | null;
  size: number;
  errorCorrectionLevel: string;
  storeId: string | null;
  campaignId: string | null;
  scansCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string;
};

/**
 * Transform server QR code data to QRCodeListItem
 * Transforme les données du serveur en QRCodeListItem pour l'affichage
 */
export function transformToQRCodeListItem(qrCode: QRCodeServerData): QRCodeListItem {
  return {
    id: qrCode.id,
    name: qrCode.name,
    url: qrCode.url,
    type: qrCode.type as 'STATIC' | 'DYNAMIC',
    style: qrCode.style as 'DOTS' | 'ROUNDED' | 'SQUARE' | 'CLASSY' | 'CIRCULAR',
    animation: qrCode.animation as
      | 'NONE'
      | 'RIPPLE'
      | 'PULSE'
      | 'WAVE'
      | 'ROTATE3D'
      | 'GLOW'
      | 'CIRCULAR_RIPPLE'
      | null,
    foregroundColor: qrCode.foregroundColor,
    backgroundColor: qrCode.backgroundColor,
    logoUrl: qrCode.logoUrl,
    logoStoragePath: qrCode.logoStoragePath,
    logoSize: qrCode.logoSize,
    size: qrCode.size,
    errorCorrectionLevel: qrCode.errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
    storeId: qrCode.storeId,
    campaignId: qrCode.campaignId,
    scanCount: qrCode.scansCount,
    lastScannedAt: null,
    expiresAt: null,
    createdAt: new Date(qrCode.createdAt),
    updatedAt: new Date(qrCode.updatedAt),
    createdBy: qrCode.createdBy,
    stats: {
      totalScans: qrCode.scansCount,
      lastScanDate: null,
      daysUntilExpiry: null,
      isExpired: false,
    },
  };
}

/**
 * Transform multiple QR codes at once
 * Transforme plusieurs QR codes à la fois
 */
export function transformToQRCodeListItems(qrCodes: QRCodeServerData[]): QRCodeListItem[] {
  return qrCodes.map(transformToQRCodeListItem);
}
