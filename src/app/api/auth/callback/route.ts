/**
 * Auth Callback API Route
 * Gère l'échange du code OAuth/Magic Link contre une session
 * IMPORTANT: ZERO any types
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sessionService } from '@/infrastructure/auth/session.service';
import { brandUserId } from '@/lib/types/branded.type';

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

    // Valider et brander l'userId pour type-safety
    const userIdResult = brandUserId(user.id);
    if (!userIdResult.success) {
      console.error('Invalid user ID from Supabase:', userIdResult.error);
      return NextResponse.redirect(new URL('/login?error=invalid_user_id', request.url));
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
      return NextResponse.redirect(new URL('/login?error=session_failed', request.url));
    }

    // Succès ! Rediriger vers le dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err) {
    console.error('Auth callback GET error:', err);
    return NextResponse.redirect(new URL('/login?error=unexpected_error', request.url));
  }
}

/**
 * POST handler pour OAuth callback (existant)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { code: string };
    const { code } = body;

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

    // Valider et brander l'userId pour type-safety
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
