/**
 * Auth Callback API Route
 * Gère l'échange du code OAuth/Magic Link contre une session
 * IMPORTANT: ZERO any types
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Session, User } from '@supabase/supabase-js';
import { sessionService } from '@/infrastructure/auth/session.service';
import { brandUserId } from '@/lib/types/branded.type';
import { PrismaGameUserRepository } from '@/infrastructure/repositories/prisma-gameuser.repository';

// Validate environment variables at module load
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase configuration: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set',
  );
}

// Type-safe constants after validation
const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ========== HELPER FUNCTIONS ==========

/**
 * Crée un client Supabase configuré pour l'authentification
 */
function createAuthClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Extrait le nom d'utilisateur depuis les métadonnées
 */
function extractUserName(userMetadata: Record<string, unknown> | undefined): string {
  if (!userMetadata) return 'Joueur';
  const givenName = userMetadata.given_name;
  const name = userMetadata.name;
  return typeof givenName === 'string' ? givenName : typeof name === 'string' ? name : 'Joueur';
}

/**
 * Extrait l'URL de l'avatar depuis les métadonnées
 */
function extractAvatarUrl(userMetadata: Record<string, unknown> | undefined): string | undefined {
  if (!userMetadata) return undefined;
  const avatarUrl = userMetadata.avatar_url;
  return typeof avatarUrl === 'string' ? avatarUrl : undefined;
}

/**
 * Crée un GameUser et retourne la réponse de redirection
 */
async function handleGameAuth(
  user: User,
  session: Session,
  campaignId: string,
  requestUrl: string,
): Promise<NextResponse> {
  const gameUserRepo = new PrismaGameUserRepository();
  const gameUserResult = await gameUserRepo.upsert({
    supabaseId: user.id,
    email: user.email ?? '',
    name: extractUserName(user.user_metadata),
    avatarUrl: extractAvatarUrl(user.user_metadata),
    provider: 'google',
  });

  if (!gameUserResult.success) {
    return NextResponse.redirect(
      new URL(`/c/${campaignId}?error=game_user_creation_failed`, requestUrl),
    );
  }

  const response = NextResponse.redirect(new URL(`/play/${campaignId}`, requestUrl));
  setGameCookies(response, session, gameUserResult.data);
  return response;
}

/**
 * Configure les cookies pour l'authentification jeu
 */
function setGameCookies(
  response: NextResponse,
  session: Session,
  gameUser: { id: string; email: string; name: string | null },
): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieMaxAge = 60 * 60 * 24 * 7; // 7 jours

  response.cookies.set('cb-game-session', session.access_token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: cookieMaxAge,
    path: '/',
  });

  response.cookies.set(
    'cb-game-user',
    JSON.stringify({
      id: gameUser.id,
      email: gameUser.email,
      name: gameUser.name,
    }),
    {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: cookieMaxAge,
      path: '/',
    },
  );
}

/**
 * Crée une session admin et retourne la réponse de redirection
 */
async function handleAdminAuth(
  user: User,
  session: Session,
  requestUrl: string,
): Promise<NextResponse> {
  const userIdResult = brandUserId(user.id);
  if (!userIdResult.success) {
    return NextResponse.redirect(new URL('/login?error=invalid_user_id', requestUrl));
  }

  const tokens = {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresIn: session.expires_in ?? 3600,
    expiresAt: session.expires_at ?? Date.now() / 1000 + 3600,
  };

  const sessionResult = await sessionService.createSession(tokens, userIdResult.data);

  if (!sessionResult.success) {
    return NextResponse.redirect(new URL('/login?error=session_failed', requestUrl));
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl));
}

// ========== MAIN HANDLER ==========

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

    // Early returns pour les erreurs
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url),
      );
    }

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Échanger le code contre une session
    const supabase = createAuthClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data.session) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(exchangeError?.message || 'session_error')}`,
          request.url,
        ),
      );
    }

    const { session, user } = data;

    // Déléguer le traitement selon le type d'auth
    if (campaignId) {
      return await handleGameAuth(user, session, campaignId, request.url);
    }

    return await handleAdminAuth(user, session, request.url);
  } catch (_err) {
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
  } catch (_err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
