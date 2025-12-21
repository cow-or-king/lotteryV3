/**
 * GameUser Repository - Prisma Implementation
 * Gère les utilisateurs qui se connectent via Google OAuth sur les landing pages
 * Ces utilisateurs n'ont PAS accès au dashboard admin
 * IMPORTANT: ZERO any types
 */

import { PrismaClient } from '@/generated/prisma';
import type { Result } from '@/lib/types/result.type';

const prisma = new PrismaClient();

export interface GameUserData {
  supabaseId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  provider?: string;
}

export interface GameUser {
  id: string;
  supabaseId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  provider: string;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PrismaGameUserRepository {
  /**
   * Créer ou mettre à jour un GameUser après authentification Google
   */
  async upsert(data: GameUserData): Promise<Result<GameUser>> {
    try {
      const gameUser = await prisma.gameUser.upsert({
        where: {
          supabaseId: data.supabaseId,
        },
        create: {
          supabaseId: data.supabaseId,
          email: data.email,
          name: data.name ?? null,
          avatarUrl: data.avatarUrl ?? null,
          provider: data.provider ?? 'google',
          lastLoginAt: new Date(),
        },
        update: {
          email: data.email,
          name: data.name ?? undefined,
          avatarUrl: data.avatarUrl ?? undefined,
          lastLoginAt: new Date(),
        },
      });

      return {
        success: true,
        data: gameUser,
      };
    } catch (error) {
      console.error("Erreur lors de l'upsert du GameUser:", error);
      return {
        success: false,
        error: new Error("Impossible de créer/mettre à jour l'utilisateur de jeu"),
      };
    }
  }

  /**
   * Récupérer un GameUser par son Supabase ID
   */
  async getBySupabaseId(supabaseId: string): Promise<Result<GameUser | null>> {
    try {
      const gameUser = await prisma.gameUser.findUnique({
        where: { supabaseId },
      });

      return {
        success: true,
        data: gameUser,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du GameUser:', error);
      return {
        success: false,
        error: new Error("Impossible de récupérer l'utilisateur de jeu"),
      };
    }
  }

  /**
   * Récupérer un GameUser par son email
   */
  async getByEmail(email: string): Promise<Result<GameUser | null>> {
    try {
      const gameUser = await prisma.gameUser.findFirst({
        where: { email },
      });

      return {
        success: true,
        data: gameUser,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du GameUser:', error);
      return {
        success: false,
        error: new Error("Impossible de récupérer l'utilisateur de jeu"),
      };
    }
  }
}
