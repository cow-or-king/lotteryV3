/**
 * Google Business Profile API - tRPC Router
 * Gère la connexion et la synchronisation des avis Google Business
 *
 * Architecture: Infrastructure Layer (API)
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { google } from 'googleapis';
import { prisma } from '@/infrastructure/database/prisma-client';
import { decryptToken } from '@/lib/encryption/token-encryption.service';

// Validate environment variables
if (
  !process.env.GOOGLE_BUSINESS_CLIENT_ID ||
  !process.env.GOOGLE_BUSINESS_CLIENT_SECRET ||
  !process.env.NEXT_PUBLIC_APP_URL
) {
  throw new Error('Missing Google Business OAuth configuration');
}

const CLIENT_ID = process.env.GOOGLE_BUSINESS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_BUSINESS_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-business/callback`;
const SCOPES = ['https://www.googleapis.com/auth/business.manage'];

/**
 * Crée un client OAuth2 Google
 */
function createOAuth2Client() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

export const googleBusinessRouter = createTRPCRouter({
  /**
   * Génère l'URL d'autorisation OAuth pour Google Business
   */
  getAuthUrl: protectedProcedure.query(() => {
    const oauth2Client = createOAuth2Client();

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // Force l'affichage du consent screen pour obtenir un refresh token
    });

    return { authUrl };
  }),

  /**
   * Vérifie si l'utilisateur a connecté son compte Google Business
   */
  getConnectionStatus: protectedProcedure.query(async ({ ctx }) => {
    const token = await prisma.googleBusinessToken.findUnique({
      where: { userId: ctx.session.userId },
      select: {
        id: true,
        accountId: true,
        locationId: true,
        locationName: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!token) {
      return {
        isConnected: false,
        token: null,
      };
    }

    const isExpired = token.expiresAt < new Date();

    return {
      isConnected: !isExpired,
      token: {
        accountId: token.accountId,
        locationId: token.locationId,
        locationName: token.locationName,
        expiresAt: token.expiresAt.toISOString(),
        createdAt: token.createdAt.toISOString(),
        updatedAt: token.updatedAt.toISOString(),
      },
    };
  }),

  /**
   * Récupère les locations (commerces) Google Business de l'utilisateur
   */
  getLocations: protectedProcedure.query(async ({ ctx }) => {
    const tokenRecord = await prisma.googleBusinessToken.findUnique({
      where: { userId: ctx.session.userId },
    });

    if (!tokenRecord) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Google Business account not connected',
      });
    }

    // Déchiffrer les tokens
    const accessToken = decryptToken(tokenRecord.accessToken);
    const refreshToken = decryptToken(tokenRecord.refreshToken);

    // Configurer le client OAuth avec les tokens
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    try {
      // Créer le client Google My Business
      const mybusiness = google.mybusinessaccountmanagement({
        version: 'v1',
        auth: oauth2Client,
      });

      // Récupérer les accounts
      const accountsResponse = await mybusiness.accounts.list();
      const accounts = accountsResponse.data.accounts || [];

      if (accounts.length === 0) {
        return { locations: [] };
      }

      // Pour chaque account, récupérer les locations
      const allLocations: Array<{
        name: string;
        accountId: string;
        locationId: string;
        displayName: string;
        address?: string;
      }> = [];

      for (const account of accounts) {
        if (!account.name) continue;

        const mybusinessinfo = google.mybusinessbusinessinformation({
          version: 'v1',
          auth: oauth2Client,
        });

        const locationsResponse = await mybusinessinfo.accounts.locations.list({
          parent: account.name,
        });

        const locations = locationsResponse.data.locations || [];

        for (const location of locations) {
          if (!location.name || !location.title) continue;

          // Extraire l'ID de la location depuis le name (format: accounts/{accountId}/locations/{locationId})
          const locationIdMatch = location.name.match(/locations\/(.+)$/);
          const locationId = locationIdMatch ? locationIdMatch[1] : location.name;

          allLocations.push({
            name: location.name,
            accountId: account.name,
            locationId: locationId ?? '',
            displayName: location.title,
            address: location.storefrontAddress?.addressLines?.join(', '),
          });
        }
      }

      return { locations: allLocations };
    } catch (error) {
      console.error('Error fetching Google Business locations:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch Google Business locations',
      });
    }
  }),

  /**
   * Sélectionne une location (commerce) Google Business
   */
  selectLocation: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        locationId: z.string(),
        locationName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.googleBusinessToken.update({
        where: { userId: ctx.session.userId },
        data: {
          accountId: input.accountId,
          locationId: input.locationId,
          locationName: input.locationName,
          updatedAt: new Date(),
        },
      });

      return { success: true };
    }),

  /**
   * Déconnecte le compte Google Business
   */
  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.googleBusinessToken.delete({
      where: { userId: ctx.session.userId },
    });

    return { success: true };
  }),
});
