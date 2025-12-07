/**
 * Auth Callback API Route
 * Gère l'échange du code OAuth/Magic Link contre une session
 * IMPORTANT: ZERO any types
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sessionService } from '@/infrastructure/auth/session.service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

    // Créer la session avec cookies HTTP-only
    const tokens = {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in ?? 3600,
      expiresAt: session.expires_at ?? Date.now() / 1000 + 3600,
    };

    const sessionResult = await sessionService.createSession(tokens, user.id);

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
