/**
 * QR Code Style Builder
 * Handles QR code style generation (SVG/PNG)
 * IMPORTANT: ZERO any types
 */

import * as QRCode from 'qrcode';
import type { ErrorCorrectionLevel } from '@/lib/types/qr-code.types';

export interface QRCodeStyleOptions {
  url: string;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  width?: number;
}

/**
 * Generates a QR Code SVG (vectoriel)
 */
export async function generateQRCodeSVG(options: QRCodeStyleOptions): Promise<string> {
  const {
    url,
    foregroundColor,
    backgroundColor,
    errorCorrectionLevel,
    margin,
    width = 2048,
  } = options;

  const svg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
    margin,
    width, // Haute résolution pour impression
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  });

  return svg;
}

/**
 * Generates a QR Code PNG (raster HD)
 */
export async function generateQRCodePNG(options: QRCodeStyleOptions): Promise<Buffer> {
  const {
    url,
    foregroundColor,
    backgroundColor,
    errorCorrectionLevel,
    margin,
    width = 2048,
  } = options;

  const buffer = await QRCode.toBuffer(url, {
    type: 'png',
    errorCorrectionLevel: errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
    margin,
    width,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  });

  return buffer;
}
