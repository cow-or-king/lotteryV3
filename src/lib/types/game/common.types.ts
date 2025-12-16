/**
 * Common Game Design Types
 * Types partagés entre plusieurs types de jeux
 */

// =====================
// COLOR MODES
// =====================

export const ColorModeEnum = {
  BI_COLOR: 'BI_COLOR', // Segments pairs/impairs avec 2 couleurs
  MULTI_COLOR: 'MULTI_COLOR', // Chaque segment a sa propre couleur
} as const;

export type ColorMode = (typeof ColorModeEnum)[keyof typeof ColorModeEnum];
