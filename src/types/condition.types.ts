/**
 * Campaign Condition Types
 * Types TypeScript pour le système de conditions modulaires
 * IMPORTANT: ZERO any types
 */

import type { ConditionType } from '@/generated/prisma';

/**
 * Configuration spécifique pour chaque type de condition
 */

// Google Review Config
export interface GoogleReviewConfig {
  googleReviewUrl: string;
  waitTimeSeconds: number; // Temps d'attente après le clic (15-25s)
}

// Instagram Follow Config
export interface InstagramFollowConfig {
  instagramUrl: string;
  username: string;
}

// TikTok Follow Config
export interface TikTokFollowConfig {
  tiktokUrl: string;
  username: string;
}

// Newsletter Config
export interface NewsletterConfig {
  emailProvider?: string; // ex: "mailchimp", "sendinblue"
  listId?: string;
}

// Loyalty Program Config
export interface LoyaltyProgramConfig {
  programUrl: string;
  programName: string;
}

// Custom Redirect Config
export interface CustomRedirectConfig {
  redirectUrl: string;
  buttonText: string;
  instructionText: string;
}

/**
 * Union type de toutes les configs possibles
 */
export type ConditionConfig =
  | GoogleReviewConfig
  | InstagramFollowConfig
  | TikTokFollowConfig
  | NewsletterConfig
  | LoyaltyProgramConfig
  | CustomRedirectConfig;

/**
 * Type pour une condition de campagne
 */
export interface CampaignConditionData {
  id: string;
  campaignId: string;
  type: ConditionType;
  order: number;
  title: string;
  description: string | null;
  redirectUrl: string | null;
  iconEmoji: string | null;
  config: ConditionConfig | null;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type pour la progression d'un participant
 */
export interface ParticipantProgress {
  completedConditions: Array<{
    conditionId: string;
    completedAt: string; // ISO date string
    type: ConditionType;
  }>;
  currentConditionOrder: number;
}

/**
 * Metadata pour afficher chaque type de condition
 */
export interface ConditionTypeMetadata {
  type: ConditionType;
  label: string;
  description: string;
  defaultIcon: string;
  color: string; // Couleur pour l'UI
  requiresAuth: boolean; // Si nécessite une authentification
}

/**
 * Dictionnaire des métadonnées par type
 */
export const CONDITION_TYPE_METADATA: Record<ConditionType, ConditionTypeMetadata> = {
  GOOGLE_REVIEW: {
    type: 'GOOGLE_REVIEW',
    label: 'Avis Google',
    description: 'Demander un avis sur Google My Business',
    defaultIcon: '✍️',
    color: '#4285F4',
    requiresAuth: false,
  },
  INSTAGRAM_FOLLOW: {
    type: 'INSTAGRAM_FOLLOW',
    label: 'Follow Instagram',
    description: 'Suivre le compte Instagram',
    defaultIcon: '📸',
    color: '#E4405F',
    requiresAuth: false,
  },
  TIKTOK_FOLLOW: {
    type: 'TIKTOK_FOLLOW',
    label: 'Follow TikTok',
    description: 'Suivre le compte TikTok',
    defaultIcon: '🎵',
    color: '#000000',
    requiresAuth: false,
  },
  NEWSLETTER: {
    type: 'NEWSLETTER',
    label: 'Newsletter',
    description: "S'inscrire à la newsletter",
    defaultIcon: '📧',
    color: '#00C853',
    requiresAuth: false,
  },
  LOYALTY_PROGRAM: {
    type: 'LOYALTY_PROGRAM',
    label: 'Programme Fidélité',
    description: 'Rejoindre le programme de fidélité',
    defaultIcon: '🎁',
    color: '#FF6F00',
    requiresAuth: false,
  },
  CUSTOM_REDIRECT: {
    type: 'CUSTOM_REDIRECT',
    label: 'Action Personnalisée',
    description: 'Redirection vers une URL personnalisée',
    defaultIcon: '🔗',
    color: '#9C27B0',
    requiresAuth: false,
  },
};

/**
 * Helper pour créer une nouvelle condition
 */
export function createDefaultCondition(
  type: ConditionType,
  order: number,
): Partial<CampaignConditionData> {
  const metadata = CONDITION_TYPE_METADATA[type];

  return {
    type,
    order,
    title: metadata.label,
    description: metadata.description,
    iconEmoji: metadata.defaultIcon,
    isRequired: true,
    config: null,
  };
}

/**
 * Helper pour vérifier si un participant a complété une condition
 */
export function hasCompletedCondition(progress: ParticipantProgress, conditionId: string): boolean {
  return progress.completedConditions.some((c) => c.conditionId === conditionId);
}

/**
 * Helper pour obtenir la prochaine condition à compléter
 */
export function getNextCondition(
  conditions: CampaignConditionData[],
  progress: ParticipantProgress,
): CampaignConditionData | null {
  const sortedConditions = [...conditions].sort((a, b) => a.order - b.order);
  return (
    sortedConditions.find((c) => !hasCompletedCondition(progress, c.id) && c.isRequired) || null
  );
}
