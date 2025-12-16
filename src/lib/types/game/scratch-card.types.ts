/**
 * Scratch Card Game Design Types
 * Types pour la configuration VISUELLE des cartes à gratter
 */

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
  return DEFAULT_SCRATCH_DESIGNS.classic!;
}
