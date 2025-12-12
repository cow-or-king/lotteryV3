/**
 * QR Code Types
 * IMPORTANT: ZERO any types
 */

// =====================
// ENUMS (Mirror Prisma)
// =====================

export const QRCodeTypeEnum = {
  STATIC: 'STATIC', // Pour print, ne change jamais
  DYNAMIC: 'DYNAMIC', // Pour campagnes, peut être réassigné
} as const;

export type QRCodeType = (typeof QRCodeTypeEnum)[keyof typeof QRCodeTypeEnum];

export const QRCodeStyleEnum = {
  DOTS: 'DOTS', // Points arrondis
  ROUNDED: 'ROUNDED', // Coins arrondis
  SQUARE: 'SQUARE', // Carré classique
  CLASSY: 'CLASSY', // Style élégant avec dégradés
  CIRCULAR: 'CIRCULAR', // Forme ronde (QR code circulaire)
} as const;

export type QRCodeStyle = (typeof QRCodeStyleEnum)[keyof typeof QRCodeStyleEnum];

export const QRCodeAnimationEnum = {
  NONE: 'NONE', // Pas d'animation
  RIPPLE: 'RIPPLE', // Onde de choc (recommandé)
  PULSE: 'PULSE', // Pulsation douce
  WAVE: 'WAVE', // Vague dans les points
  ROTATE3D: 'ROTATE3D', // Rotation 3D
  GLOW: 'GLOW', // Lumière néon
  CIRCULAR_RIPPLE: 'CIRCULAR_RIPPLE', // Onde circulaire (pour CIRCULAR style)
} as const;

export type QRCodeAnimation = (typeof QRCodeAnimationEnum)[keyof typeof QRCodeAnimationEnum];

export const ErrorCorrectionLevelEnum = {
  L: 'L', // ~7% correction
  M: 'M', // ~15% correction (recommandé)
  Q: 'Q', // ~25% correction
  H: 'H', // ~30% correction (avec logo)
} as const;

export type ErrorCorrectionLevel =
  (typeof ErrorCorrectionLevelEnum)[keyof typeof ErrorCorrectionLevelEnum];

export const LogoSizeEnum = {
  SMALL: 'SMALL', // 60px
  MEDIUM: 'MEDIUM', // 80px (défaut)
  LARGE: 'LARGE', // 120px
} as const;

export type LogoSize = (typeof LogoSizeEnum)[keyof typeof LogoSizeEnum];

/**
 * Conversion LogoSize enum vers pixels
 */
export const LOGO_SIZE_TO_PIXELS: Record<LogoSize, number> = {
  SMALL: 60,
  MEDIUM: 80,
  LARGE: 120,
};

// =====================
// QR CODE DATA
// =====================

/**
 * Données complètes d'un QR code (DB)
 */
export interface QRCodeData {
  id: string;
  name: string;
  url: string;
  type: QRCodeType;
  style: QRCodeStyle;
  animation: QRCodeAnimation | null;
  foregroundColor: string;
  backgroundColor: string;
  logoUrl: string | null;
  logoStoragePath: string | null;
  logoSize: number | null;
  size: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  storeId: string | null;
  campaignId: string | null;
  scanCount: number;
  lastScannedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Input pour créer un QR code
 */
export interface CreateQRCodeInput {
  name: string;
  url: string;
  type?: QRCodeType;
  style?: QRCodeStyle;
  animation?: QRCodeAnimation | null;
  foregroundColor?: string;
  backgroundColor?: string;
  logoUrl?: string | null;
  logoStoragePath?: string | null;
  logoSize?: number | null;
  size?: number;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  storeId?: string | null;
  campaignId?: string | null;
}

/**
 * Input pour mettre à jour un QR code
 */
export interface UpdateQRCodeInput {
  id: string;
  name?: string;
  url?: string;
  style?: QRCodeStyle;
  animation?: QRCodeAnimation | null;
  foregroundColor?: string;
  backgroundColor?: string;
  logoUrl?: string | null;
  logoStoragePath?: string | null;
  logoSize?: number | null;
  size?: number;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  storeId?: string | null;
  campaignId?: string | null;
}

/**
 * Input pour personnaliser un QR code par défaut de Store
 */
export interface CustomizeQRCodeInput {
  qrCodeId: string;
  style: QRCodeStyle;
  foregroundColor: string;
  backgroundColor: string;
  logoSize: LogoSize | null;
  errorCorrectionLevel: ErrorCorrectionLevel;
}

/**
 * Résultat de personnalisation
 */
export interface CustomizeQRCodeResult {
  success: boolean;
  qrCodeId: string;
  svgUrl: string;
  pngUrl: string;
  customizedAt: Date;
}

/**
 * Input pour exporter un QR code
 */
export interface ExportQRCodeInput {
  qrCodeId: string;
  format: 'SVG' | 'PNG';
}

/**
 * Résultat d'export
 */
export interface ExportQRCodeResult {
  downloadUrl: string;
  expiresAt: Date;
}

// =====================
// QR CODE GENERATION
// =====================

/**
 * Options pour générer un QR code
 */
export interface QRCodeGenerationOptions {
  url: string;
  style: QRCodeStyle;
  animation?: QRCodeAnimation | null;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  logoUrl?: string | null;
  logoSize?: number;
  margin?: number;
}

/**
 * Résultat de génération QR code
 */
export interface QRCodeGenerationResult {
  dataUrl: string; // Base64 data URL
  svg: string; // SVG string
  blob: Blob; // Blob pour téléchargement
}

/**
 * Format d'export
 */
export const ExportFormatEnum = {
  PNG: 'PNG',
  SVG: 'SVG',
  PDF: 'PDF',
} as const;

export type ExportFormat = (typeof ExportFormatEnum)[keyof typeof ExportFormatEnum];

/**
 * Options d'export
 */
export interface QRCodeExportOptions {
  format: ExportFormat;
  filename?: string;
  quality?: number; // 0-1 pour PNG
}

// =====================
// UI HELPERS
// =====================

/**
 * Style prévisualisé pour UI
 */
export interface QRCodeStylePreview {
  style: QRCodeStyle;
  label: string;
  description: string;
  icon: string;
  recommended?: boolean;
}

/**
 * Animation prévisualisée pour UI
 */
export interface QRCodeAnimationPreview {
  animation: QRCodeAnimation;
  label: string;
  description: string;
  badge?: string;
}

/**
 * Statistiques QR code (pour liste)
 */
export interface QRCodeStats {
  totalScans: number;
  lastScanDate: Date | null;
  daysUntilExpiry: number | null;
  isExpired: boolean;
}

/**
 * Liste complète pour affichage
 */
export interface QRCodeListItem extends QRCodeData {
  stats: QRCodeStats;
  storeName?: string | null;
  campaignName?: string | null;
}

// =====================
// VALIDATION
// =====================

/**
 * Erreurs de validation
 */
export interface QRCodeValidationError {
  field: string;
  message: string;
}

/**
 * Résultat de validation
 */
export interface QRCodeValidationResult {
  isValid: boolean;
  errors: QRCodeValidationError[];
}

// =====================
// CONSTANTS
// =====================

/**
 * Tailles disponibles
 */
export const QR_CODE_SIZES = [256, 512, 1024, 2048] as const;
export type QRCodeSize = (typeof QR_CODE_SIZES)[number];

/**
 * Taille par défaut
 */
export const DEFAULT_QR_CODE_SIZE = 512;

/**
 * Couleurs par défaut
 */
export const DEFAULT_FOREGROUND_COLOR = '#000000';
export const DEFAULT_BACKGROUND_COLOR = '#FFFFFF';

/**
 * Taille logo par défaut (en px)
 */
export const DEFAULT_LOGO_SIZE = 80;

/**
 * Taille max fichier logo (2MB)
 */
export const MAX_LOGO_FILE_SIZE = 2 * 1024 * 1024;

/**
 * Formats logo acceptés
 */
export const ACCEPTED_LOGO_FORMATS = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

/**
 * URL max length (pour QR code)
 */
export const MAX_URL_LENGTH = 2048;

/**
 * Prévisualisations styles
 */
export const QR_CODE_STYLE_PREVIEWS: QRCodeStylePreview[] = [
  {
    style: QRCodeStyleEnum.DOTS,
    label: 'Dots',
    description: 'Points arrondis modernes',
    icon: '⚫',
    recommended: true,
  },
  {
    style: QRCodeStyleEnum.ROUNDED,
    label: 'Rounded',
    description: 'Coins arrondis élégants',
    icon: '▢',
  },
  {
    style: QRCodeStyleEnum.SQUARE,
    label: 'Square',
    description: 'Classique carré',
    icon: '■',
  },
  {
    style: QRCodeStyleEnum.CLASSY,
    label: 'Classy',
    description: 'Style premium avec dégradés',
    icon: '✨',
  },
  {
    style: QRCodeStyleEnum.CIRCULAR,
    label: 'Circular',
    description: 'Forme ronde unique',
    icon: '⭕',
  },
];

/**
 * Prévisualisations animations
 */
export const QR_CODE_ANIMATION_PREVIEWS: QRCodeAnimationPreview[] = [
  {
    animation: QRCodeAnimationEnum.NONE,
    label: 'Aucune',
    description: "Pas d'animation",
  },
  {
    animation: QRCodeAnimationEnum.RIPPLE,
    label: 'Ripple',
    description: 'Onde de choc',
    badge: 'Recommandé',
  },
  {
    animation: QRCodeAnimationEnum.PULSE,
    label: 'Pulse',
    description: 'Pulsation douce',
    badge: 'Subtil',
  },
  {
    animation: QRCodeAnimationEnum.WAVE,
    label: 'Wave',
    description: 'Vague dans les points',
    badge: 'Dynamique',
  },
  {
    animation: QRCodeAnimationEnum.ROTATE3D,
    label: 'Rotate 3D',
    description: 'Rotation spectaculaire',
    badge: 'Premium',
  },
  {
    animation: QRCodeAnimationEnum.GLOW,
    label: 'Glow',
    description: 'Lumière néon pulsante',
    badge: 'Moderne',
  },
  {
    animation: QRCodeAnimationEnum.CIRCULAR_RIPPLE,
    label: 'Circular Ripple',
    description: 'Onde circulaire',
    badge: 'Nouveau !',
  },
];
