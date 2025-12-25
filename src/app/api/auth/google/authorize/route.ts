/**
 * Google OAuth Authorization Endpoint
 * Initie le flow OAuth2 pour obtenir l'accès à Google My Business API
 */

import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
);

export async function GET() {
  try {
    // Générer l'URL d'autorisation Google
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Nécessaire pour obtenir refresh_token
      prompt: 'consent', // Force l'affichage du consentement (pour avoir le refresh token)
      scope: [
        'https://www.googleapis.com/auth/business.manage', // My Business API
      ],
    });

    // Rediriger vers Google OAuth
    return NextResponse.redirect(authUrl);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to generate authorization URL' }, { status: 500 });
  }
}
