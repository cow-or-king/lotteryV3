/**
 * Game Design Types
 * Types pour la configuration VISUELLE des jeux (séparée des gains)
 * IMPORTANT: ZERO any types
 */

// =====================
// COLOR MODES
// =====================

export const ColorModeEnum = {
  BI_COLOR: 'BI_COLOR', // Segments pairs/impairs avec 2 couleurs
  MULTI_COLOR: 'MULTI_COLOR', // Chaque segment a sa propre couleur
} as const;

export type ColorMode = (typeof ColorModeEnum)[keyof typeof ColorModeEnum];

// =====================
// WHEEL DESIGN (Configuration visuelle uniquement)
// =====================

export interface WheelSegmentDesign {
  id: string;
  label: string; // Placeholder comme "Gain 1", "Gain 2", etc.
  color: string; // Couleur du segment
  textColor?: string; // Couleur du texte
}

export interface WheelDesignConfig {
  // Identifiant
  id?: string;
  name: string; // Nom du design (ex: "Roue Noël 2024")

  // Mode couleur
  colorMode: ColorMode;

  // Couleurs pour bi-color
  primaryColor?: string; // Pour segments pairs
  secondaryColor?: string; // Pour segments impairs

  // Segments (avec couleurs individuelles si multi-color)
  segments: WheelSegmentDesign[];
  numberOfSegments: number; // 4, 6, 8, 10, 12

  // Logo central
  centerLogoUrl: string | null;
  centerLogoSize: number; // Taille en pixels

  // Style
  backgroundColor: string;
  segmentBorderWidth: number;
  segmentBorderColor: string;

  // Texte sur les segments
  showSegmentText: boolean; // Afficher ou masquer le texte
  textSize: number; // Taille du texte
  textFont: string; // Police
  textRotation: number; // Inclinaison du texte en degrés (0-90)

  // Centre
  centerCircleColor: string;
  centerCircleSize: number;

  // Flèche/Pointeur
  pointerColor: string;
  pointerStyle: 'arrow' | 'triangle' | 'circle';

  // Animation
  animationSpeed: 'slow' | 'normal' | 'fast';
  spinDuration: number; // Durée en ms

  // Son
  enableSound: boolean;

  // Metadata
  isDefault?: boolean; // Design par défaut
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
}

// =====================
// DEFAULT DESIGNS
// =====================

export const DEFAULT_WHEEL_DESIGNS: Record<string, WheelDesignConfig> = {
  multicolor: {
    name: 'Roue Multicolor',
    colorMode: 'MULTI_COLOR',
    numberOfSegments: 8,
    segments: [
      { id: '1', label: 'Gain 1', color: '#8B5CF6', textColor: '#FFFFFF' },
      { id: '2', label: 'Gain 2', color: '#EC4899', textColor: '#FFFFFF' },
      { id: '3', label: 'Gain 3', color: '#3B82F6', textColor: '#FFFFFF' },
      { id: '4', label: 'Gain 4', color: '#10B981', textColor: '#FFFFFF' },
      { id: '5', label: 'Gain 5', color: '#F59E0B', textColor: '#FFFFFF' },
      { id: '6', label: 'Gain 6', color: '#EF4444', textColor: '#FFFFFF' },
      { id: '7', label: 'Gain 7', color: '#06B6D4', textColor: '#FFFFFF' },
      { id: '8', label: 'Gain 8', color: '#8B5CF6', textColor: '#FFFFFF' },
    ],
    centerLogoUrl: null,
    centerLogoSize: 80,
    backgroundColor: '#FFFFFF',
    segmentBorderWidth: 2,
    segmentBorderColor: '#FFFFFF',
    showSegmentText: true,
    textSize: 16,
    textFont: 'Arial',
    textRotation: 0,
    centerCircleColor: '#FFFFFF',
    centerCircleSize: 100,
    pointerColor: '#FBBF24',
    pointerStyle: 'arrow',
    animationSpeed: 'normal',
    spinDuration: 4000,
    enableSound: true,
    isDefault: true,
  },

  bicolor: {
    name: 'Roue Bi-color',
    colorMode: 'BI_COLOR',
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    numberOfSegments: 8,
    segments: [
      { id: '1', label: 'Gain 1', color: '#8B5CF6', textColor: '#FFFFFF' },
      { id: '2', label: 'Gain 2', color: '#EC4899', textColor: '#FFFFFF' },
      { id: '3', label: 'Gain 3', color: '#8B5CF6', textColor: '#FFFFFF' },
      { id: '4', label: 'Gain 4', color: '#EC4899', textColor: '#FFFFFF' },
      { id: '5', label: 'Gain 5', color: '#8B5CF6', textColor: '#FFFFFF' },
      { id: '6', label: 'Gain 6', color: '#EC4899', textColor: '#FFFFFF' },
      { id: '7', label: 'Gain 7', color: '#8B5CF6', textColor: '#FFFFFF' },
      { id: '8', label: 'Gain 8', color: '#EC4899', textColor: '#FFFFFF' },
    ],
    centerLogoUrl: null,
    centerLogoSize: 80,
    backgroundColor: '#FFFFFF',
    segmentBorderWidth: 2,
    segmentBorderColor: '#FFFFFF',
    showSegmentText: true,
    textSize: 16,
    textFont: 'Arial',
    textRotation: 0,
    centerCircleColor: '#FFFFFF',
    centerCircleSize: 100,
    pointerColor: '#FBBF24',
    pointerStyle: 'arrow',
    animationSpeed: 'normal',
    spinDuration: 4000,
    enableSound: true,
    isDefault: true,
  },
};

// =====================
// HELPERS
// =====================

/**
 * Génère une couleur aléatoire vive pour les segments
 */
export function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 65 + Math.floor(Math.random() * 25); // 65-90%
  const lightness = 45 + Math.floor(Math.random() * 15); // 45-60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Convertit HSL en HEX
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Génère une couleur aléatoire en format HEX
 */
export function generateRandomHexColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 65 + Math.floor(Math.random() * 25); // 65-90%
  const lightness = 45 + Math.floor(Math.random() * 15); // 45-60%
  return hslToHex(hue, saturation, lightness);
}

/**
 * Génère des segments selon le mode couleur
 */
export function generateSegments(
  numberOfSegments: number,
  colorMode: ColorMode,
  primaryColor: string,
  secondaryColor: string,
): WheelSegmentDesign[] {
  const segments: WheelSegmentDesign[] = [];

  for (let i = 0; i < numberOfSegments; i++) {
    let color: string;

    if (colorMode === 'BI_COLOR') {
      // Mode bi-color: alternance entre deux couleurs
      color = i % 2 === 0 ? primaryColor : secondaryColor;
    } else {
      // Mode multi-color: couleurs aléatoires pour chaque segment
      color = generateRandomHexColor();
    }

    segments.push({
      id: String(i + 1),
      label: `Gain ${i + 1}`,
      color,
      textColor: '#FFFFFF',
    });
  }

  return segments;
}

/**
 * Génère deux couleurs aléatoires pour le mode bi-color
 */
export function generateRandomBiColors(): { primary: string; secondary: string } {
  return {
    primary: generateRandomHexColor(),
    secondary: generateRandomHexColor(),
  };
}

/**
 * Récupère le design par défaut
 */
export function getDefaultWheelDesign(): WheelDesignConfig {
  return DEFAULT_WHEEL_DESIGNS.multicolor;
}

// =====================
// SCRATCH CARD DESIGN
// =====================

export const ScratchWinPatternEnum = {
  THREE_IN_ROW: 'THREE_IN_ROW',
  ALL_MATCH: 'ALL_MATCH',
  ANY_THREE: 'ANY_THREE',
} as const;

export type ScratchWinPattern = (typeof ScratchWinPatternEnum)[keyof typeof ScratchWinPatternEnum];

export const ScratchAnimationEnum = {
  FADE: 'FADE',
  PARTICLE: 'PARTICLE',
  SHINE: 'SHINE',
} as const;

export type ScratchAnimation = (typeof ScratchAnimationEnum)[keyof typeof ScratchAnimationEnum];

export interface ScratchZone {
  id: string;
  x: number; // Position en %
  y: number; // Position en %
  width: number; // Taille en %
  height: number; // Taille en %
  content: string; // Symbole ou texte
  isWinning: boolean;
}

export interface ScratchDesignConfig {
  id?: string;
  userId?: string;
  name: string;
  // Visual
  cardWidth: number;
  cardHeight: number;
  backgroundColor: string;
  foregroundColor: string; // Couleur de la couche à gratter
  scratchImage?: string | null;
  // Win zones
  zones: ScratchZone[];
  winPattern: ScratchWinPattern;
  symbols: string[]; // ['🎁', '💎', '⭐', '🍀']
  // Animation
  scratchAnimation: ScratchAnimation;
  revealDuration: number; // En ms
  // Metadata
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const DEFAULT_SCRATCH_DESIGNS: Record<string, ScratchDesignConfig> = {
  classic: {
    name: 'Carte à gratter classique',
    cardWidth: 400,
    cardHeight: 300,
    backgroundColor: '#FFFFFF',
    foregroundColor: '#C0C0C0',
    scratchImage: null,
    zones: [
      { id: '1', x: 10, y: 30, width: 25, height: 35, content: '🎁', isWinning: true },
      { id: '2', x: 37.5, y: 30, width: 25, height: 35, content: '💎', isWinning: false },
      { id: '3', x: 65, y: 30, width: 25, height: 35, content: '⭐', isWinning: false },
    ],
    winPattern: 'THREE_IN_ROW',
    symbols: ['🎁', '💎', '⭐', '🍀', '🎰', '💰'],
    scratchAnimation: 'FADE',
    revealDuration: 1000,
    isDefault: true,
  },
  luxury: {
    name: 'Carte à gratter luxe',
    cardWidth: 400,
    cardHeight: 300,
    backgroundColor: '#1F2937',
    foregroundColor: '#FFD700',
    scratchImage: null,
    zones: [
      { id: '1', x: 5, y: 20, width: 20, height: 25, content: '💎', isWinning: false },
      { id: '2', x: 27.5, y: 20, width: 20, height: 25, content: '💎', isWinning: true },
      { id: '3', x: 50, y: 20, width: 20, height: 25, content: '💰', isWinning: false },
      { id: '4', x: 72.5, y: 20, width: 20, height: 25, content: '🍀', isWinning: false },
      { id: '5', x: 5, y: 55, width: 20, height: 25, content: '⭐', isWinning: false },
      { id: '6', x: 27.5, y: 55, width: 20, height: 25, content: '💎', isWinning: true },
      { id: '7', x: 50, y: 55, width: 20, height: 25, content: '🎁', isWinning: false },
      { id: '8', x: 72.5, y: 55, width: 20, height: 25, content: '💎', isWinning: true },
    ],
    winPattern: 'ANY_THREE',
    symbols: ['💎', '💰', '⭐', '🍀', '🎁'],
    scratchAnimation: 'SHINE',
    revealDuration: 1500,
    isDefault: true,
  },
};

export function getDefaultScratchDesign(): ScratchDesignConfig {
  return DEFAULT_SCRATCH_DESIGNS.classic;
}

// =====================
// SLOT MACHINE DESIGN
// =====================

export const SlotSpinEasingEnum = {
  LINEAR: 'LINEAR',
  EASE_OUT: 'EASE_OUT',
  BOUNCE: 'BOUNCE',
} as const;

export type SlotSpinEasing = (typeof SlotSpinEasingEnum)[keyof typeof SlotSpinEasingEnum];

export interface SlotSymbol {
  id: string;
  icon: string; // Emoji ou URL d'image
  value: number; // Points
  color: string;
}

export interface SlotWinPattern {
  id: string;
  matchCount: 2 | 3; // Nombre de symboles identiques requis
  symbol: string; // Le symbole gagnant
  multiplier: number; // Multiplicateur de gain
  probability: number; // Probabilité en % (0-100)
  label: string; // Label du gain (ex: "Petit gain", "Jackpot")
}

export interface SlotMachineDesignConfig {
  id?: string;
  userId?: string;
  name: string;
  // Visual
  reelsCount: 3 | 4 | 5;
  symbolsPerReel: number;
  backgroundColor: string;
  reelBorderColor: string;
  // Symbols
  symbols: SlotSymbol[];
  // Animation
  spinDuration: number; // En ms
  spinEasing: SlotSpinEasing;
  reelDelay: number; // Délai entre chaque rouleau en ms
  // Win patterns
  winPatterns: SlotWinPattern[];
  // Metadata
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const DEFAULT_SLOT_MACHINE_DESIGNS: Record<string, SlotMachineDesignConfig> = {
  classic: {
    name: 'Machine à sous classique',
    reelsCount: 3,
    symbolsPerReel: 3,
    backgroundColor: '#1F2937',
    reelBorderColor: '#FFD700',
    symbols: [
      { id: '1', icon: '🍒', value: 10, color: '#EF4444' },
      { id: '2', icon: '🍋', value: 20, color: '#F59E0B' },
      { id: '3', icon: '🍊', value: 30, color: '#F97316' },
      { id: '4', icon: '🍇', value: 40, color: '#8B5CF6' },
      { id: '5', icon: '💎', value: 50, color: '#3B82F6' },
      { id: '6', icon: '⭐', value: 100, color: '#FBBF24' },
    ],
    spinDuration: 3000,
    spinEasing: 'EASE_OUT',
    reelDelay: 200,
    winPatterns: [
      // 2 symboles - Haute probabilité (gains fréquents)
      { id: '1', matchCount: 2, symbol: '🍒', multiplier: 2, probability: 25, label: 'Petit gain' },
      { id: '2', matchCount: 2, symbol: '🍋', multiplier: 3, probability: 20, label: 'Petit gain' },
      { id: '3', matchCount: 2, symbol: '🍊', multiplier: 4, probability: 15, label: 'Gain moyen' },
      { id: '4', matchCount: 2, symbol: '🍇', multiplier: 5, probability: 10, label: 'Gain moyen' },
      { id: '5', matchCount: 2, symbol: '💎', multiplier: 8, probability: 5, label: 'Bon gain' },
      { id: '6', matchCount: 2, symbol: '⭐', multiplier: 10, probability: 3, label: 'Gros gain' },

      // 3 symboles - Faible probabilité (gains rares mais élevés)
      {
        id: '7',
        matchCount: 3,
        symbol: '🍒',
        multiplier: 10,
        probability: 5,
        label: 'Gain triple',
      },
      { id: '8', matchCount: 3, symbol: '🍋', multiplier: 20, probability: 3, label: 'Super gain' },
      {
        id: '9',
        matchCount: 3,
        symbol: '🍊',
        multiplier: 30,
        probability: 2,
        label: 'Excellent gain',
      },
      {
        id: '10',
        matchCount: 3,
        symbol: '🍇',
        multiplier: 40,
        probability: 1.5,
        label: 'Énorme gain',
      },
      {
        id: '11',
        matchCount: 3,
        symbol: '💎',
        multiplier: 50,
        probability: 0.8,
        label: 'Mega gain',
      },
      {
        id: '12',
        matchCount: 3,
        symbol: '⭐',
        multiplier: 100,
        probability: 0.5,
        label: 'JACKPOT',
      },
    ],
    isDefault: true,
  },
  deluxe: {
    name: 'Machine à sous deluxe',
    reelsCount: 5,
    symbolsPerReel: 3,
    backgroundColor: '#111827',
    reelBorderColor: '#EC4899',
    symbols: [
      { id: '1', icon: '7️⃣', value: 777, color: '#EF4444' },
      { id: '2', icon: '💰', value: 100, color: '#FBBF24' },
      { id: '3', icon: '💎', value: 75, color: '#3B82F6' },
      { id: '4', icon: '🍀', value: 50, color: '#10B981' },
      { id: '5', icon: '🎰', value: 40, color: '#8B5CF6' },
      { id: '6', icon: '🎁', value: 30, color: '#EC4899' },
    ],
    spinDuration: 4000,
    spinEasing: 'BOUNCE',
    reelDelay: 300,
    winPatterns: [
      { pattern: ['7️⃣', '7️⃣', '7️⃣', '7️⃣', '7️⃣'], multiplier: 777 },
      { pattern: ['💰', '💰', '💰', '💰', '💰'], multiplier: 100 },
      { pattern: ['💎', '💎', '💎', '💎', '💎'], multiplier: 75 },
    ],
    isDefault: true,
  },
};

export function getDefaultSlotMachineDesign(): SlotMachineDesignConfig {
  return DEFAULT_SLOT_MACHINE_DESIGNS.classic;
}

// =====================
// WHEEL MINI DESIGN
// =====================

export const WheelMiniStyleEnum = {
  FLAT: 'FLAT',
  GRADIENT: 'GRADIENT',
} as const;

export type WheelMiniStyle = (typeof WheelMiniStyleEnum)[keyof typeof WheelMiniStyleEnum];

export interface WheelMiniDesignConfig {
  id?: string;
  userId?: string;
  name: string;
  // Simplified - only essential config
  segments: 4 | 6 | 8;
  colors: string[]; // 2 alternating colors
  spinDuration: number; // En ms (plus rapide que la roue normale)
  style: WheelMiniStyle;
  // Metadata
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const DEFAULT_WHEEL_MINI_DESIGNS: Record<string, WheelMiniDesignConfig> = {
  fast: {
    name: 'Roue rapide',
    segments: 6,
    colors: ['#8B5CF6', '#EC4899'],
    spinDuration: 2000,
    style: 'FLAT',
    isDefault: true,
  },
  gradient: {
    name: 'Roue gradient',
    segments: 8,
    colors: ['#3B82F6', '#10B981'],
    spinDuration: 2500,
    style: 'GRADIENT',
    isDefault: true,
  },
};

export function getDefaultWheelMiniDesign(): WheelMiniDesignConfig {
  return DEFAULT_WHEEL_MINI_DESIGNS.fast;
}
