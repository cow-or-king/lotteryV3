/**
 * Google OAuth Callback Endpoint
 * Reçoit le code d'autorisation et l'échange contre un refresh token
 */

import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Si l'utilisateur refuse
    if (error) {
      return NextResponse.redirect(
        new URL(`/admin?error=google_auth_denied&message=${error}`, request.url),
      );
    }

    // Si pas de code
    if (!code) {
      return NextResponse.redirect(new URL('/admin?error=no_code', request.url));
    }

    // Échanger le code contre des tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      console.warn('No refresh token received. User may have already authorized this app.');
      return NextResponse.redirect(
        new URL(
          '/admin?error=no_refresh_token&message=Please revoke access and try again',
          request.url,
        ),
      );
    }

    console.warn('='.repeat(80));
    console.warn('✅ GOOGLE OAUTH SUCCESS');
    console.warn('='.repeat(80));
    console.warn('Refresh Token:', tokens.refresh_token);
    console.warn('');
    console.warn('⚠️  IMPORTANT: Copy this refresh token and store it encrypted in your database');
    console.warn('   It will be used to fetch reviews from Google My Business');
    console.warn('='.repeat(80));

    // TODO: Stocker le refresh_token chiffré dans la BDD
    // const encryptedToken = await encryptionService.encrypt(tokens.refresh_token);
    // await prisma.store.update({ where: { id: storeId }, data: { googleApiKey: encryptedToken } });

    // Rediriger vers l'admin avec succès
    return NextResponse.redirect(
      new URL(
        '/admin?success=google_auth&refresh_token=' + encodeURIComponent(tokens.refresh_token),
        request.url,
      ),
    );
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return NextResponse.redirect(new URL('/admin?error=token_exchange_failed', request.url));
  }
}
