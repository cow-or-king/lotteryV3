/**
 * Auth Callback API Route
 * Gère l'échange du code OAuth/Magic Link contre une session
 * IMPORTANT: ZERO any types
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sessionService } from '@/infrastructure/auth/session.service';
import { brandUserId } from '@/lib/types/branded.type';
import { PrismaGameUserRepository } from '@/infrastructure/repositories/prisma-gameuser.repository';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET handler pour Magic Link callback
 * Supabase redirige vers cette route avec ?code=XXX
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const campaignId = searchParams.get('campaignId');

    // Si erreur dans l'URL
    if (error) {
      console.error('Auth callback error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url),
      );
    }

    // Si pas de code, rediriger vers login
    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Créer un client Supabase pour échanger le code
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Échanger le code contre une session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data.session) {
      console.error('Failed to exchange code:', exchangeError);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(exchangeError?.message || 'session_error')}`,
          request.url,
        ),
      );
    }

    const { session, user } = data;

    // Si campaignId présent = Auth Jeu (Google depuis /c/[shortCode])
    // Sinon = Auth Admin (login email/password)
    const isGameAuth = !!campaignId;

    if (isGameAuth) {
      // Pour le jeu, créer/mettre à jour le GameUser dans la BD
      const gameUserRepo = new PrismaGameUserRepository();
      const gameUserResult = await gameUserRepo.upsert({
        supabaseId: user.id,
        email: user.email ?? '',
        name: user.user_metadata?.given_name || user.user_metadata?.name || 'Joueur',
        avatarUrl: user.user_metadata?.avatar_url,
        provider: 'google',
      });

      if (!gameUserResult.success) {
        console.error('Failed to create/update GameUser:', gameUserResult.error);
        return NextResponse.redirect(
          new URL(`/c/${campaignId}?error=game_user_creation_failed`, request.url),
        );
      }

      const response = NextResponse.redirect(new URL(`/play/${campaignId}`, request.url));

      // IMPORTANT: Pour l'auth jeu, on ne crée PAS de cookies admin
      // On crée UNIQUEMENT des cookies game
      response.cookies.set('rl-game-session', session.access_token, {
        httpOnly: false, // Doit être accessible côté client
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        path: '/',
      });

      // Stocker aussi les infos utilisateur pour affichage
      response.cookies.set(
        'rl-game-user',
        JSON.stringify({
          id: gameUserResult.data.id,
          email: gameUserResult.data.email,
          name: gameUserResult.data.name,
        }),
        {
          httpOnly: false, // Accessible côté client pour affichage
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        },
      );

      console.log('✅ GameUser créé/mis à jour:', gameUserResult.data.id);
      console.log('✅ Cookies game créés, PAS de cookies admin');
      return response;
    }

    // Auth Admin : utiliser le système de session existant
    const userIdResult = brandUserId(user.id);
    if (!userIdResult.success) {
      console.error('Invalid user ID from Supabase:', userIdResult.error);
      return NextResponse.redirect(new URL('/login?error=invalid_user_id', request.url));
    }

    const tokens = {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in ?? 3600,
      expiresAt: session.expires_at ?? Date.now() / 1000 + 3600,
    };

    const sessionResult = await sessionService.createSession(tokens, userIdResult.data);

    if (!sessionResult.success) {
      console.error('Failed to create session:', sessionResult.error);
      return NextResponse.redirect(new URL('/login?error=session_failed', request.url));
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err) {
    console.error('Auth callback GET error:', err);
    return NextResponse.redirect(new URL('/login?error=unexpected_error', request.url));
  }
}

/**
 * POST handler pour OAuth callback (utilisé par /auth/callback page)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { code: string; campaignId?: string };
    const { code, campaignId } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Créer un client Supabase pour échanger le code
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Échanger le code contre une session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      console.error('Failed to exchange code:', error);
      return NextResponse.json({ error: 'Failed to authenticate with code' }, { status: 401 });
    }

    const { session, user } = data;

    // Si campaignId présent = Auth Jeu (Google depuis /c/[shortCode])
    // Sinon = Auth Admin (login email/password)
    const isGameAuth = !!campaignId;

    if (isGameAuth) {
      // Pour le jeu, on retourne juste les infos utilisateur
      // Les cookies seront gérés côté page via redirect
      return NextResponse.json({
        success: true,
        isGameAuth: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.given_name || user.user_metadata?.name || 'Joueur',
        },
        session: {
          access_token: session.access_token,
        },
      });
    }

    // Auth Admin : utiliser le système de session existant
    const userIdResult = brandUserId(user.id);
    if (!userIdResult.success) {
      console.error('Invalid user ID from Supabase:', userIdResult.error);
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 500 });
    }

    // Créer la session avec cookies HTTP-only
    const tokens = {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in ?? 3600,
      expiresAt: session.expires_at ?? Date.now() / 1000 + 3600,
    };

    const sessionResult = await sessionService.createSession(tokens, userIdResult.data);

    if (!sessionResult.success) {
      console.error('Failed to create session:', sessionResult.error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      isGameAuth: false,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Auth callback error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
