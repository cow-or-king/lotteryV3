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
