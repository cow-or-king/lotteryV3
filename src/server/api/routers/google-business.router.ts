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
import { googleBusinessOAuthService } from '@/infrastructure/services/google-business-oauth.service';

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
  getAuthUrl: protectedProcedure.input(z.object({ storeId: z.string() })).query(({ input }) => {
    const oauth2Client = createOAuth2Client();

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // Force l'affichage du consent screen pour obtenir un refresh token
      state: input.storeId, // Passer le storeId dans le state pour le callback
    });

    return { authUrl };
  }),

  /**
   * Vérifie si un store a connecté son compte Google Business
   */
  getConnectionStatus: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        console.log('[getConnectionStatus] Input:', input);
        console.log('[getConnectionStatus] userId:', ctx.userId);

        // Vérifier que le store appartient à l'utilisateur
        const store = await prisma.store.findFirst({
          where: {
            id: input.storeId,
            brand: {
              ownerId: ctx.userId,
            },
          },
        });

        console.log('[getConnectionStatus] Store found:', !!store);

        if (!store) {
          console.error(
            '[getConnectionStatus] Store not found for storeId:',
            input.storeId,
            'userId:',
            ctx.userId,
          );
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Store not found',
          });
        }

        const token = await prisma.googleBusinessToken.findUnique({
          where: { storeId: input.storeId },
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

        console.log('[getConnectionStatus] Token found:', !!token);

        if (!token) {
          return {
            isConnected: false,
            token: null,
          };
        }

        const isExpired = token.expiresAt < new Date();

        console.log('[getConnectionStatus] Is expired:', isExpired);

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
      } catch (error) {
        console.error('[getConnectionStatus] ERROR:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }),

  /**
   * Récupère les locations (commerces) Google Business d'un store
   */
  getLocations: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Vérifier que le store appartient à l'utilisateur
      const store = await prisma.store.findFirst({
        where: {
          id: input.storeId,
          brand: {
            ownerId: ctx.userId,
          },
        },
      });

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store not found',
        });
      }

      const tokenRecord = await prisma.googleBusinessToken.findUnique({
        where: { storeId: input.storeId },
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
        console.log('[Google Business] Fetching accounts...');
        const accountsResponse = await mybusiness.accounts.list();
        const accounts = accountsResponse.data.accounts || [];
        console.log('[Google Business] Found', accounts.length, 'accounts');

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

          console.log('[Google Business] Fetching locations for account:', account.name);

          const mybusinessinfo = google.mybusinessbusinessinformation({
            version: 'v1',
            auth: oauth2Client,
          });

          const locationsResponse = await mybusinessinfo.accounts.locations.list({
            parent: account.name,
          });

          const locations = locationsResponse.data.locations || [];
          console.log('[Google Business] Found', locations.length, 'locations for account');

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

        console.log('[Google Business] Total locations found:', allLocations.length);
        return { locations: allLocations };
      } catch (error) {
        console.error('[Google Business] Error fetching locations:', error);
        // Log plus de détails sur l'erreur
        if (error && typeof error === 'object' && 'message' in error) {
          console.error('[Google Business] Error message:', (error as Error).message);
        }
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as { response?: { data?: unknown; status?: number } };
          console.error('[Google Business] API response status:', apiError.response?.status);
          console.error('[Google Business] API response data:', apiError.response?.data);
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch Google Business locations',
        });
      }
    }),

  /**
   * Sélectionne une location (commerce) Google Business pour un store
   */
  selectLocation: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        accountId: z.string(),
        locationId: z.string(),
        locationName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le store appartient à l'utilisateur
      const store = await prisma.store.findFirst({
        where: {
          id: input.storeId,
          brand: {
            ownerId: ctx.userId,
          },
        },
      });

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store not found',
        });
      }

      await prisma.googleBusinessToken.update({
        where: { storeId: input.storeId },
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
   * Déconnecte le compte Google Business d'un store
   */
  disconnect: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le store appartient à l'utilisateur
      const store = await prisma.store.findFirst({
        where: {
          id: input.storeId,
          brand: {
            ownerId: ctx.userId,
          },
        },
      });

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store not found',
        });
      }

      await prisma.googleBusinessToken.delete({
        where: { storeId: input.storeId },
      });

      return { success: true };
    }),

  /**
   * Récupère les avis Google Business pour un store
   */
  getReviews: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Vérifier que le store appartient à l'utilisateur
      const store = await prisma.store.findFirst({
        where: {
          id: input.storeId,
          brand: {
            ownerId: ctx.userId,
          },
        },
      });

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store not found',
        });
      }

      // Récupérer les avis via le service OAuth
      const result = await googleBusinessOAuthService.fetchReviews(input.storeId);

      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error.message,
        });
      }

      return { reviews: result.data };
    }),

  /**
   * Répond à un avis Google Business
   */
  replyToReview: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        reviewName: z.string(),
        replyText: z.string().min(1).max(4096),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le store appartient à l'utilisateur
      const store = await prisma.store.findFirst({
        where: {
          id: input.storeId,
          brand: {
            ownerId: ctx.userId,
          },
        },
      });

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store not found',
        });
      }

      // Publier la réponse via le service OAuth
      const result = await googleBusinessOAuthService.replyToReview(
        input.storeId,
        input.reviewName,
        input.replyText,
      );

      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error.message,
        });
      }

      return { success: true };
    }),
});
