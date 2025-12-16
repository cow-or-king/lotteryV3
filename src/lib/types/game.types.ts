/**
 * Game Types
 * Types pour le système de jeux gamifiés
 * IMPORTANT: ZERO any types
 */

// =====================
// ENUMS
// =====================

export const GameTypeEnum = {
  WHEEL: 'WHEEL', // Roue de la fortune
  SCRATCH: 'SCRATCH', // Carte à gratter
  SLOT_MACHINE: 'SLOT_MACHINE', // Machine à sous
  MEMORY: 'MEMORY', // Jeu de mémoire
  SHAKE: 'SHAKE', // Secouer pour gagner
  WHEEL_MINI: 'WHEEL_MINI', // Roue rapide
  DICE: 'DICE', // Lancer de dés
  MYSTERY_BOX: 'MYSTERY_BOX', // Boîte mystère
} as const;

export type GameType = (typeof GameTypeEnum)[keyof typeof GameTypeEnum];

export const PrizeTypeEnum = {
  DISCOUNT: 'DISCOUNT', // Réduction %
  PRODUCT: 'PRODUCT', // Produit gratuit
  POINTS: 'POINTS', // Points fidélité
  VOUCHER: 'VOUCHER', // Code promo
  CUSTOM: 'CUSTOM', // Personnalisé
  NONE: 'NONE', // Perdu
} as const;

export type PrizeType = (typeof PrizeTypeEnum)[keyof typeof PrizeTypeEnum];

export const GameStatusEnum = {
  DRAFT: 'DRAFT', // Brouillon
  ACTIVE: 'ACTIVE', // Actif
  PAUSED: 'PAUSED', // En pause
  ENDED: 'ENDED', // Terminé
} as const;

export type GameStatus = (typeof GameStatusEnum)[keyof typeof GameStatusEnum];

// =====================
// PRIZE
// =====================

export interface Prize {
  id: string;
  label: string; // "10% de réduction"
  value: string; // "10"
  probability: number; // 0-100
  imageUrl: string | null;
  type: PrizeType;
  color?: string; // Couleur du segment (pour roue)
  textColor?: string; // Couleur du texte
}

export interface CreatePrizeInput {
  label: string;
  value: string;
  probability: number;
  imageUrl?: string | null;
  type: PrizeType;
  color?: string;
  textColor?: string;
}

// =====================
// GAME CONFIGURATION
// =====================

/**
 * Configuration commune à tous les jeux
 */
export interface GameBaseConfig {
  // Branding
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  logoUrl: string | null;
  backgroundImage: string | null;

  // Textes
  title: string;
  description: string;
  buttonText: string;
  winMessage: string;
  loseMessage: string;
  termsUrl: string | null;

  // Sons
  enableSound: boolean;
  backgroundMusic: string | null;
  clickSound: string | null;
  winSound: string | null;
  loseSound: string | null;

  // Vibration
  enableVibration: boolean;

  // Animation
  animationSpeed: 'slow' | 'normal' | 'fast';
  enableParticles: boolean;
}

/**
 * Segment de la roue de la fortune
 */
export interface WheelSegment {
  id: string;
  label: string;
  color: string;
  probability: number;
  prize: {
    type: 'PRIZE' | 'DISCOUNT' | 'NOTHING';
    value: string;
  };
}

/**
 * Configuration spécifique à la Roue de la Fortune
 */
export interface WheelGameConfig extends GameBaseConfig {
  // Segments
  segments: WheelSegment[];
  segmentBorderWidth: number;
  segmentBorderColor: string;

  // Centre
  centerLogoSize: number;
  centerCircleColor: string;
  centerCircleSize: number;

  // Flèche/Pointeur
  pointerColor: string;
  pointerStyle: 'arrow' | 'triangle' | 'circle';

  // Rotation
  minSpins: number; // Nombre minimum de tours
  maxSpins: number; // Nombre maximum de tours
  spinDuration: number; // Durée en ms
  easing: 'linear' | 'easeOut' | 'easeInOut' | 'bounce';

  // Son spécifique
  tickSound: string | null;
  tickVolume: number; // 0-100
}

/**
 * Symbole de la machine à sous
 */
export interface SlotSymbol {
  id: string;
  icon: string;
  value: number;
  color: string;
}

/**
 * Pattern gagnant pour slot machine
 */
export interface SlotWinningPattern {
  symbols: [string, string, string];
  prizeIndex: number;
}

/**
 * Configuration spécifique à la Machine à Sous
 */
export interface SlotMachineGameConfig {
  // Rouleaux
  reelsCount: number; // Nombre de rouleaux (généralement 3)
  symbolsPerReel: number; // Nombre de symboles par rouleau
  symbols: SlotSymbol[]; // Symboles disponibles

  // Animation
  spinDuration: number; // Durée en ms
  spinEasing: 'LINEAR' | 'EASE_OUT' | 'EASE_IN_OUT';

  // Apparence
  backgroundColor: string;
  reelBorderColor: string;

  // Winning patterns
  winningPatterns?: SlotWinningPattern[];
}

/**
 * Union type pour toutes les configs
 */
export type GameConfig = WheelGameConfig; // | ScratchGameConfig | SlotGameConfig...

// =====================
// GAME
// =====================

export interface Game {
  id: string;
  type: GameType;
  status: GameStatus;
  name: string;
  description: string | null;

  // Configuration
  config: GameConfig;

  // Gains
  prizes: Prize[];

  // Restrictions
  maxPlaysPerUser: number | null;
  maxPlaysPerDay: number | null;
  requireAuth: boolean;
  startDate: Date | null;
  endDate: Date | null;

  // Relations
  storeId: string | null;
  campaignId: string | null;

  // Statistiques
  totalPlays: number;
  totalWins: number;
  totalLoses: number;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateGameInput {
  type: GameType;
  name: string;
  description?: string | null;
  config: GameConfig;
  prizes: CreatePrizeInput[];
  maxPlaysPerUser?: number | null;
  maxPlaysPerDay?: number | null;
  requireAuth?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  storeId?: string | null;
  campaignId?: string | null;
}

export interface UpdateGameInput {
  id: string;
  status?: GameStatus;
  name?: string;
  description?: string | null;
  config?: Partial<GameConfig>;
  prizes?: CreatePrizeInput[];
  maxPlaysPerUser?: number | null;
  maxPlaysPerDay?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

// =====================
// GAME INSTANCE (partie jouée)
// =====================

export interface GameInstance {
  id: string;
  gameId: string;
  game: Game;

  // Joueur
  userId: string | null;
  userEmail: string | null;
  userName: string | null;

  // Résultat
  hasWon: boolean;
  prizeId: string | null;
  prize: Prize | null;

  // Metadata
  playedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  deviceType: 'mobile' | 'tablet' | 'desktop' | null;
}

export interface CreateGameInstanceInput {
  gameId: string;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  hasWon: boolean;
  prizeId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceType?: 'mobile' | 'tablet' | 'desktop' | null;
}

// =====================
// GAME RESULT (pour UI)
// =====================

export interface GameResult {
  hasWon: boolean;
  prize: Prize | null;
  message: string;
  canPlayAgain: boolean;
  remainingPlays: number | null;
}

// =====================
// GAME STATS
// =====================

export interface GameStats {
  totalPlays: number;
  totalWins: number;
  totalLoses: number;
  winRate: number; // 0-100
  uniquePlayers: number;
  playsToday: number;
  playsThisWeek: number;
  playsThisMonth: number;
  topPrizes: Array<{
    prize: Prize;
    count: number;
  }>;
  playsByDay: Array<{
    date: string;
    plays: number;
    wins: number;
  }>;
}

// =====================
// VALIDATION
// =====================

export interface GameValidationError {
  field: string;
  message: string;
}

export interface GameValidationResult {
  isValid: boolean;
  errors: GameValidationError[];
}
