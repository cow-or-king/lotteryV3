/**
 * Google Business Profile API - OAuth Callback Route
 * Gère le callback OAuth 2.0 pour connecter un compte Google Business
 *
 * IMPORTANT: ZERO any types
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/infrastructure/database/prisma-client';
import { encryptToken } from '@/lib/encryption/token-encryption.service';
import { getServerSession } from '@/infrastructure/auth/session.service';

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

/**
 * Crée un client OAuth2 Google
 */
function createOAuth2Client() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

/**
 * GET /api/auth/google-business/callback
 * Gère le callback OAuth après autorisation Google
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Récupérer le code d'autorisation
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Gérer les erreurs OAuth
    if (error) {
      return NextResponse.redirect(
        new URL(
          `/dashboard/reviews?error=${encodeURIComponent(error)}&source=google-business`,
          request.url,
        ),
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/reviews?error=no_code&source=google-business', request.url),
      );
    }

    // Vérifier que l'utilisateur est authentifié
    const session = await getServerSession();
    if (!session) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized&source=google-business', request.url),
      );
    }

    // Échanger le code contre des tokens
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(
        new URL('/dashboard/reviews?error=missing_tokens&source=google-business', request.url),
      );
    }

    // Chiffrer les tokens
    const encryptedAccessToken = encryptToken(tokens.access_token);
    const encryptedRefreshToken = encryptToken(tokens.refresh_token);

    // Calculer la date d'expiration
    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000); // 1h par défaut

    // Sauvegarder les tokens en base de données (upsert)
    await prisma.googleBusinessToken.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
      },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
        updatedAt: new Date(),
      },
    });

    // Rediriger vers le dashboard reviews avec succès
    return NextResponse.redirect(
      new URL('/dashboard/reviews?success=google_business_connected', request.url),
    );
  } catch (err) {
    console.error('Google Business OAuth callback error:', err);

    return NextResponse.redirect(
      new URL('/dashboard/reviews?error=oauth_failed&source=google-business', request.url),
    );
  }
}
