/**
 * Default Game Configurations
 * Templates de configuration par défaut pour chaque type de jeu
 * IMPORTANT: ZERO any types
 */

import { GameType, WheelGameConfig, PrizeType } from '@/lib/types/game.types';

// =====================
// WHEEL TEMPLATES
// =====================

export const wheelTemplates = {
  classic: {
    name: 'Roue Classique',
    description: 'Configuration standard avec 8 segments colorés',
    config: {
      // Branding
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
      backgroundColor: '#FFFFFF',
      logoUrl: null,
      backgroundImage: null,

      // Textes
      title: 'Tournez la roue !',
      description: 'Tentez votre chance et gagnez des récompenses',
      buttonText: 'TOURNER',
      winMessage: 'Félicitations ! Vous avez gagné :',
      loseMessage: 'Pas de chance cette fois... Retentez votre chance !',
      termsUrl: null,

      // Sons
      enableSound: true,
      backgroundMusic: null,
      clickSound: null,
      winSound: null,
      loseSound: null,

      // Vibration
      enableVibration: true,

      // Animation
      animationSpeed: 'normal' as const,
      enableParticles: true,

      // Segments
      segments: [
        {
          id: '1',
          label: '10% de réduction',
          color: '#8B5CF6',
          probability: 25,
          prize: { type: 'DISCOUNT' as const, value: '10' },
        },
        {
          id: '2',
          label: 'Café offert',
          color: '#EC4899',
          probability: 20,
          prize: { type: 'PRODUCT' as const, value: 'cafe' },
        },
        {
          id: '3',
          label: '5% de réduction',
          color: '#3B82F6',
          probability: 30,
          prize: { type: 'DISCOUNT' as const, value: '5' },
        },
        {
          id: '4',
          label: 'Perdu',
          color: '#6B7280',
          probability: 25,
          prize: { type: 'NOTHING' as const, value: '' },
        },
      ],
      segmentBorderWidth: 2,
      segmentBorderColor: '#FFFFFF',

      // Centre
      centerLogoSize: 80,
      centerCircleColor: '#FFFFFF',
      centerCircleSize: 100,

      // Flèche/Pointeur
      pointerColor: '#FBBF24',
      pointerStyle: 'arrow' as const,

      // Rotation
      minSpins: 3,
      maxSpins: 5,
      spinDuration: 4000,
      easing: 'easeOut' as const,

      // Son spécifique
      tickSound: null,
      tickVolume: 50,
    } as WheelGameConfig,
  },

  premium: {
    name: 'Roue Premium',
    description: 'Design haut de gamme avec animations avancées',
    config: {
      primaryColor: '#F59E0B',
      secondaryColor: '#EF4444',
      backgroundColor: '#1F2937',
      logoUrl: null,
      backgroundImage: null,

      title: '🎁 Votre cadeau vous attend !',
      description: 'Tournez la roue et découvrez votre surprise',
      buttonText: 'TENTER MA CHANCE',
      winMessage: '🎉 Bravo ! Vous remportez :',
      loseMessage: '😔 Pas cette fois... Revenez demain !',
      termsUrl: null,

      enableSound: true,
      backgroundMusic: null,
      clickSound: null,
      winSound: null,
      loseSound: null,

      enableVibration: true,

      animationSpeed: 'slow' as const,
      enableParticles: true,

      segments: [
        {
          id: '1',
          label: '25% OFF',
          color: '#F59E0B',
          probability: 15,
          prize: { type: 'DISCOUNT' as const, value: '25' },
        },
        {
          id: '2',
          label: 'Produit Gratuit',
          color: '#EF4444',
          probability: 10,
          prize: { type: 'PRODUCT' as const, value: 'gratuit' },
        },
        {
          id: '3',
          label: '15% OFF',
          color: '#8B5CF6',
          probability: 20,
          prize: { type: 'DISCOUNT' as const, value: '15' },
        },
        {
          id: '4',
          label: '10% OFF',
          color: '#3B82F6',
          probability: 25,
          prize: { type: 'DISCOUNT' as const, value: '10' },
        },
        {
          id: '5',
          label: '5% OFF',
          color: '#10B981',
          probability: 30,
          prize: { type: 'DISCOUNT' as const, value: '5' },
        },
      ],
      segmentBorderWidth: 3,
      segmentBorderColor: '#FFFFFF',

      centerLogoSize: 100,
      centerCircleColor: '#FFFFFF',
      centerCircleSize: 120,

      pointerColor: '#FFFFFF',
      pointerStyle: 'triangle' as const,

      minSpins: 4,
      maxSpins: 6,
      spinDuration: 5000,
      easing: 'easeInOut' as const,

      tickSound: null,
      tickVolume: 70,
    } as WheelGameConfig,
  },

  simple: {
    name: 'Roue Minimaliste',
    description: 'Design épuré et rapide',
    config: {
      primaryColor: '#3B82F6',
      secondaryColor: '#06B6D4',
      backgroundColor: '#F9FAFB',
      logoUrl: null,
      backgroundImage: null,

      title: 'Tournez !',
      description: 'Gagnez instantanément',
      buttonText: 'GO',
      winMessage: 'Gagné !',
      loseMessage: 'Perdu !',
      termsUrl: null,

      enableSound: false,
      backgroundMusic: null,
      clickSound: null,
      winSound: null,
      loseSound: null,

      enableVibration: false,

      animationSpeed: 'fast' as const,
      enableParticles: false,

      segments: [
        {
          id: '1',
          label: 'Gagné',
          color: '#10B981',
          probability: 40,
          prize: { type: 'PRIZE' as const, value: 'gagne' },
        },
        {
          id: '2',
          label: 'Perdu',
          color: '#EF4444',
          probability: 60,
          prize: { type: 'NOTHING' as const, value: '' },
        },
      ],
      segmentBorderWidth: 1,
      segmentBorderColor: '#E5E7EB',

      centerLogoSize: 60,
      centerCircleColor: '#FFFFFF',
      centerCircleSize: 80,

      pointerColor: '#1F2937',
      pointerStyle: 'circle' as const,

      minSpins: 2,
      maxSpins: 3,
      spinDuration: 2000,
      easing: 'linear' as const,

      tickSound: null,
      tickVolume: 0,
    } as WheelGameConfig,
  },
};

// =====================
// SCRATCH TEMPLATES
// =====================

export const scratchTemplates = {
  // TODO: Ajouter les templates pour SCRATCH
};

// =====================
// SLOT MACHINE TEMPLATES
// =====================

export const slotMachineTemplates = {
  // TODO: Ajouter les templates pour SLOT_MACHINE
};

// =====================
// MYSTERY BOX TEMPLATES
// =====================

export const mysteryBoxTemplates = {
  // TODO: Ajouter les templates pour MYSTERY_BOX
};

// =====================
// DICE TEMPLATES
// =====================

export const diceTemplates = {
  // TODO: Ajouter les templates pour DICE
};

// =====================
// HELPER FUNCTIONS
// =====================

export function getTemplatesForGameType(gameType: GameType) {
  switch (gameType) {
    case 'WHEEL':
      return wheelTemplates;
    case 'SCRATCH':
      return scratchTemplates;
    case 'SLOT_MACHINE':
      return slotMachineTemplates;
    case 'MYSTERY_BOX':
      return mysteryBoxTemplates;
    case 'DICE':
      return diceTemplates;
    default:
      return {};
  }
}

export function getDefaultTemplate(gameType: GameType) {
  const templates = getTemplatesForGameType(gameType);
  const keys = Object.keys(templates);
  return keys.length > 0 ? templates[keys[0] as keyof typeof templates] : null;
}
