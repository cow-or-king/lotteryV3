/**
 * Slot Machine Game Design Types
 * Types pour la configuration VISUELLE des machines à sous
 */

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
      {
        id: '1',
        matchCount: 3,
        symbol: '7️⃣',
        multiplier: 777,
        probability: 0.1,
        label: 'JACKPOT 777',
      },
      {
        id: '2',
        matchCount: 3,
        symbol: '💰',
        multiplier: 100,
        probability: 1,
        label: 'Super gain',
      },
      { id: '3', matchCount: 3, symbol: '💎', multiplier: 75, probability: 2, label: 'Gros gain' },
    ],
    isDefault: true,
  },
};

export function getDefaultSlotMachineDesign(): SlotMachineDesignConfig {
  const classic = DEFAULT_SLOT_MACHINE_DESIGNS.classic;
  if (!classic) {
    throw new Error('Default slot machine design not found');
  }
  return classic;
}
