/**
 * Wheel Game Design Types
 * Types pour la configuration VISUELLE des jeux de roue (WHEEL et WHEEL_MINI)
 */

import { ColorMode } from './common.types';

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
  return DEFAULT_WHEEL_DESIGNS.multicolor!;
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
  return DEFAULT_WHEEL_MINI_DESIGNS.fast!;
}
