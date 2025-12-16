/**
 * Game Validation Schemas
 * Schémas de validation Zod pour les jeux
 */

import { z } from 'zod';

export const createGameSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  type: z.enum([
    'WHEEL',
    'SCRATCH',
    'SLOT_MACHINE',
    'MEMORY',
    'SHAKE',
    'WHEEL_MINI',
    'DICE',
    'MYSTERY_BOX',
  ]),
  config: z.record(z.string(), z.unknown()), // JSON config flexible selon le type de jeu
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  vibrationEnabled: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const updateGameSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  vibrationEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const recordGamePlaySchema = z.object({
  gameId: z.string().cuid(),
  result: z.record(z.string(), z.unknown()), // Résultat flexible selon le type de jeu
  prizeWon: z.string().optional(),
  prizeValue: z.number().optional(),
});

export const slotMachineDesignSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  design: z.object({
    reelsCount: z.number().min(3).max(5),
    symbolsPerReel: z.number().min(1),
    backgroundColor: z.string(),
    reelBorderColor: z.string(),
    symbols: z.array(
      z.object({
        id: z.string(),
        icon: z.string(),
        value: z.number(),
        color: z.string(),
      }),
    ),
    winPatterns: z.array(
      z.object({
        id: z.string(),
        matchCount: z.union([z.literal(2), z.literal(3)]),
        symbol: z.string(),
        multiplier: z.number(),
        probability: z.number(),
        label: z.string(),
      }),
    ),
    spinDuration: z.number(),
    spinEasing: z.enum(['LINEAR', 'EASE_OUT', 'BOUNCE']),
    reelDelay: z.number(),
  }),
});

export const wheelMiniDesignSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  design: z.object({
    segments: z.union([z.literal(4), z.literal(6), z.literal(8)]),
    colors: z.array(z.string()).min(2).max(2),
    style: z.enum(['FLAT', 'GRADIENT']),
    spinDuration: z.number().min(1000).max(4000),
  }),
});

export const playGameSchema = z.object({
  campaignId: z.string().cuid(),
  playerEmail: z.string().email(),
  playerName: z.string().min(1),
});
