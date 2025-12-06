/**
 * API Route - Auth Callback
 * Gère l'échange du code d'authentification
 * IMPORTANT: ZERO any types
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sessionService } from '@/infrastructure/auth/session.service';
import { UserRepositoryPrisma } from '@/infrastructure/repositories/prisma/user.repository.prisma';
import { SubscriptionRepositoryPrisma } from '@/infrastructure/repositories/prisma/subscription.repository.prisma';
import { RegisterUserUseCase } from '@/core/use-cases/auth/register-user.use-case';
import { prisma } from '@/infrastructure/database/prisma-client';
import type { UserId } from '@/shared/types/branded.type';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    // Créer un client Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Échanger le code contre une session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    const session = data.session;
    const user = data.user;

    // Créer les tokens
    const tokens = {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in ?? 3600,
      expiresAt: session.expires_at ?? Date.now() / 1000 + 3600,
    };

    const userId = user.id as UserId;

    // Vérifier si l'utilisateur existe dans notre DB
    const userRepository = new UserRepositoryPrisma(prisma);
    const existingUser = await userRepository.findById(userId);

    if (!existingUser && user.email) {
      // Créer l'utilisateur dans notre DB
      const subscriptionRepository = new SubscriptionRepositoryPrisma(prisma);
      const passwordHasher = {
        async hash(password: string): Promise<string> {
          return 'handled-by-supabase';
        },
      };

      const registerUseCase = new RegisterUserUseCase(
        userRepository,
        subscriptionRepository,
        passwordHasher,
      );

      await registerUseCase.execute({
        email: user.email,
        password: 'handled-by-supabase',
        name: user.user_metadata?.name as string | undefined,
      });
    }

    // Créer la session avec cookies
    await sessionService.createSession(tokens, userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Auth callback error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
