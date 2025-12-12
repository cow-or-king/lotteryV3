/**
 * QR Code Constants
 * Constantes pour la configuration des QR codes
 */

/**
 * Maximum number of QR codes that can be created in batch
 */
export const MAX_BATCH_QR_CODES = 50;

/**
 * Default QR code size for generation (in pixels)
 */
export const DEFAULT_QR_CODE_SIZE = 512;

/**
 * High resolution QR code size for export (in pixels)
 */
export const EXPORT_QR_CODE_SIZE = 1024;

/**
 * Default logo size relative to QR code (in pixels)
 */
export const DEFAULT_LOGO_SIZE = 80;

/**
 * Default error correction level
 */
export const DEFAULT_ERROR_CORRECTION_LEVEL = 'M' as const;

/**
 * Available error correction levels
 */
export const ERROR_CORRECTION_LEVELS = ['L', 'M', 'Q', 'H'] as const;

import type { QRCodeStyle, LogoSize, ErrorCorrectionLevel } from '@/lib/types/qr-code.types';

/**
 * Available QR code styles with their display labels and icons
 */
export const QR_CODE_STYLES: Array<{ value: QRCodeStyle; label: string; icon: string }> = [
  { value: 'SQUARE', label: 'Carré', icon: '■' },
  { value: 'DOTS', label: 'Points', icon: '⚫' },
  { value: 'ROUNDED', label: 'Arrondi', icon: '▢' },
  { value: 'CLASSY', label: 'Élégant', icon: '✨' },
  { value: 'CIRCULAR', label: 'Circulaire', icon: '⭕' },
];

/**
 * Available logo sizes with their display labels and pixel dimensions
 */
export const QR_CODE_LOGO_SIZES: Array<{
  value: LogoSize;
  label: string;
  description: string;
}> = [
  { value: 'SMALL', label: 'Petit', description: '60px' },
  { value: 'MEDIUM', label: 'Moyen', description: '80px' },
  { value: 'LARGE', label: 'Grand', description: '120px' },
];

/**
 * Available error correction levels with descriptions
 */
export const QR_CODE_ERROR_CORRECTION_LEVELS: Array<{
  value: ErrorCorrectionLevel;
  label: string;
  description: string;
}> = [
  { value: 'L', label: 'Faible (7%)', description: 'Sans logo recommandé' },
  { value: 'M', label: 'Moyen (15%)', description: 'Petits logos' },
  { value: 'Q', label: 'Élevé (25%)', description: 'Logos moyens' },
  { value: 'H', label: 'Maximum (30%)', description: 'Grands logos' },
];
