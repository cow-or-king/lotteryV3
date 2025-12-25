/**
 * Game Templates - Jeux pré-configurés non-persistés
 * Ces templates sont utilisés pour la création rapide de campagnes
 * IMPORTANT: Ces jeux NE sont PAS sauvegardés en base de données
 */

// Type local pour les types de jeux (évite l'import depuis Prisma)
type GameType = 'WHEEL' | 'WHEEL_MINI' | 'SLOT_MACHINE' | 'SCRATCH_CARD' | 'INSTANT_WIN' | 'MEMORY';

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  type: GameType;
  previewImage?: string;
  config: Record<string, unknown>;
  primaryColor: string;
  secondaryColor: string;
  minPrizes: number;
  maxPrizes: number;
  isTemplate: true;
}

/**
 * Couleurs par défaut pour les segments/symboles
 */
const WHEEL_COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Green
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#8B5CF6', // Purple (repeat)
  '#EC4899', // Pink (repeat)
];

/**
 * Templates de roues (WHEEL_MINI)
 */
export const WHEEL_MINI_TEMPLATES: Record<string, GameTemplate> = {
  WHEEL_MINI_3: {
    id: 'template-wheel-mini-3',
    name: 'Roue Simple (3 segments)',
    description: 'Parfait pour 3 lots différents',
    type: 'WHEEL_MINI',
    config: {
      segments: [],
      spinDuration: 3000,
      pointerPosition: 'top',
    },
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    minPrizes: 3,
    maxPrizes: 3,
    isTemplate: true,
  },
  WHEEL_MINI_4: {
    id: 'template-wheel-mini-4',
    name: 'Roue Moyenne (4 segments)',
    description: 'Parfait pour 4 lots différents',
    type: 'WHEEL_MINI',
    config: {
      segments: [],
      spinDuration: 3000,
      pointerPosition: 'top',
    },
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    minPrizes: 4,
    maxPrizes: 4,
    isTemplate: true,
  },
  WHEEL_MINI_5: {
    id: 'template-wheel-mini-5',
    name: 'Roue Standard (5 segments)',
    description: 'Parfait pour 5 lots différents',
    type: 'WHEEL_MINI',
    config: {
      segments: [],
      spinDuration: 3000,
      pointerPosition: 'top',
    },
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    minPrizes: 5,
    maxPrizes: 5,
    isTemplate: true,
  },
  WHEEL_MINI_6: {
    id: 'template-wheel-mini-6',
    name: 'Roue Large (6 segments)',
    description: 'Parfait pour 6 lots différents',
    type: 'WHEEL_MINI',
    config: {
      segments: [],
      spinDuration: 3000,
      pointerPosition: 'top',
    },
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    minPrizes: 6,
    maxPrizes: 6,
    isTemplate: true,
  },
  WHEEL_MINI_8: {
    id: 'template-wheel-mini-8',
    name: 'Roue XL (8 segments)',
    description: 'Parfait pour 8 lots différents',
    type: 'WHEEL_MINI',
    config: {
      segments: [],
      spinDuration: 3000,
      pointerPosition: 'top',
    },
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    minPrizes: 8,
    maxPrizes: 8,
    isTemplate: true,
  },
};

/**
 * Templates de machines à sous (SLOT_MACHINE)
 */
export const SLOT_MACHINE_TEMPLATES: Record<string, GameTemplate> = {
  SLOT_MACHINE_CLASSIC: {
    id: 'template-slot-machine-classic',
    name: 'Machine à sous Classique',
    description: 'Machine à sous avec 5 symboles standards',
    type: 'SLOT_MACHINE',
    config: {
      reelsCount: 3,
      symbolsPerReel: 10,
      symbols: [
        { id: 'cherry', icon: '🍒', value: 10, color: '#EF4444' },
        { id: 'lemon', icon: '🍋', value: 15, color: '#FBBF24' },
        { id: 'orange', icon: '🍊', value: 20, color: '#F97316' },
        { id: 'star', icon: '⭐', value: 50, color: '#FBBF24' },
        { id: 'seven', icon: '7️⃣', value: 100, color: '#DC2626' },
      ],
      spinDuration: 2000,
      spinEasing: 'EASE_OUT',
      backgroundColor: '#1F2937',
      reelBorderColor: '#FBBF24',
    },
    primaryColor: '#FBBF24',
    secondaryColor: '#DC2626',
    minPrizes: 1,
    maxPrizes: 50,
    isTemplate: true,
  },
};

/**
 * Tous les templates disponibles
 */
export const ALL_GAME_TEMPLATES: GameTemplate[] = [
  ...Object.values(WHEEL_MINI_TEMPLATES),
  ...Object.values(SLOT_MACHINE_TEMPLATES),
];

/**
 * Suggère un template basé sur le nombre de prizes
 */
export function suggestGameTemplate(numberOfPrizes: number): GameTemplate {
  // Pour les roues, matcher le nombre exact de segments
  if (numberOfPrizes >= 3 && numberOfPrizes <= 8) {
    const templateKey = `WHEEL_MINI_${numberOfPrizes}` as keyof typeof WHEEL_MINI_TEMPLATES;
    const template = WHEEL_MINI_TEMPLATES[templateKey];
    if (template) {
      return template;
    }
  }

  // Pour plus de 8 prizes ou moins de 3, utiliser la slot machine
  const slotMachineClassic = SLOT_MACHINE_TEMPLATES.SLOT_MACHINE_CLASSIC;
  if (!slotMachineClassic) {
    throw new Error('Slot machine classic template not found');
  }
  return slotMachineClassic;
}

/**
 * Symboles disponibles pour la slot machine
 * Ordre : du plus rare au plus commun
 */
const SLOT_SYMBOLS = ['⭐', '7️⃣', '🍊', '🍋', '🍒'];

/**
 * Interface pour un pattern gagnant de slot machine
 */
export interface SlotWinningPattern {
  symbols: [string, string, string]; // 3 symboles (un par rouleau)
  prizeIndex: number; // Index du prize correspondant
}

/**
 * Génère la config complète d'un jeu basé sur un template et des prizes
 * Cette fonction est appelée lors de la création de la campagne
 */
export function generateGameConfigFromTemplate(
  template: GameTemplate,
  prizeNames: string[],
): Record<string, unknown> {
  if (template.type === 'WHEEL_MINI') {
    const segmentCount = prizeNames.length;

    // Calculer les probabilités pour que la somme fasse exactement 100
    const baseProbability = Math.floor(100 / segmentCount);
    const remainder = 100 - baseProbability * segmentCount;

    const segments = prizeNames.map((prizeName, i) => ({
      id: `segment-${i + 1}`,
      label: prizeName,
      color: WHEEL_COLORS[i % WHEEL_COLORS.length],
      // Ajouter le reste au premier segment pour atteindre exactement 100%
      probability: i === 0 ? baseProbability + remainder : baseProbability,
      prize: {
        type: 'PRIZE' as const,
        value: prizeName,
        prizeIndex: i, // Pour le mapping Prize → Segment
      },
    }));

    return {
      ...template.config,
      segments,
    };
  }

  if (template.type === 'SLOT_MACHINE') {
    // Générer les winning patterns basés sur les prizes
    const winningPatterns: SlotWinningPattern[] = [];

    prizeNames.forEach((_prizeName, prizeIndex) => {
      // Pour chaque prize, créer des patterns de difficulté variable
      // Plus le prizeIndex est petit, plus la probabilité est élevée → patterns plus faciles

      if (prizeIndex === 0) {
        // Prize le plus fréquent (30-40%)
        // Patterns : 2 symboles identiques (n'importe lesquels)
        winningPatterns.push(
          { symbols: ['🍒', '🍒', '🍋'], prizeIndex },
          { symbols: ['🍋', '🍋', '🍒'], prizeIndex },
          { symbols: ['🍊', '🍊', '🍋'], prizeIndex },
          { symbols: ['🍒', '🍊', '🍒'], prizeIndex },
        );
      } else if (prizeIndex === 1) {
        // Prize moyen (15-25%)
        // Patterns : 2 symboles moyens ou 3 fruits différents
        winningPatterns.push(
          { symbols: ['🍊', '🍊', '🍊'], prizeIndex },
          { symbols: ['🍋', '🍋', '🍋'], prizeIndex },
        );
      } else {
        // Prizes rares (5-15%)
        // Patterns : 3 symboles rares identiques
        const symbol = SLOT_SYMBOLS[Math.min(prizeIndex - 2, SLOT_SYMBOLS.length - 1)];
        if (symbol) {
          winningPatterns.push({
            symbols: [symbol, symbol, symbol] as [string, string, string],
            prizeIndex,
          });
        }
      }
    });

    return {
      ...template.config,
      winningPatterns,
    };
  }

  // Pour les autres types, retourner la config telle quelle
  return template.config;
}

/**
 * Récupère un template par ID
 */
export function getTemplateById(templateId: string): GameTemplate | undefined {
  return ALL_GAME_TEMPLATES.find((t) => t.id === templateId);
}
