/**
 * QR Code Shape Builder
 * Handles shape and style-specific configuration (margins, dots logic)
 * IMPORTANT: ZERO any types
 */

import type { QRCodeStyle } from '@/lib/types/qr-code.types';

/**
 * Conversion style enum vers QRCode options
 * CLASSY style a besoin de plus de margin pour les dégradés
 */
export function getQRCodeMargin(style: QRCodeStyle): number {
  return style === 'CLASSY' ? 2 : 1;
}

/**
 * Returns style-specific configuration
 */
export function getStyleConfig(style: QRCodeStyle): {
  margin: number;
  description: string;
} {
  const configs: Record<QRCodeStyle, { margin: number; description: string }> = {
    SQUARE: {
      margin: 1,
      description: 'Style classique avec carrés standards',
    },
    ROUNDED: {
      margin: 1,
      description: 'Style avec coins arrondis',
    },
    DOTS: {
      margin: 1,
      description: 'Style avec points au lieu de carrés',
    },
    CLASSY: {
      margin: 2,
      description: 'Style élégant avec dégradés (besoin de margin supplémentaire)',
    },
    CIRCULAR: {
      margin: 1,
      description: 'QR code circulaire',
    },
  };

  return configs[style];
}
