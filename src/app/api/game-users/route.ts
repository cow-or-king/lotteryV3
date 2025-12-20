/**
 * Game Users API Route
 * Gère la création/mise à jour des GameUsers
 * IMPORTANT: ZERO any types
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaGameUserRepository } from '@/infrastructure/repositories/prisma-gameuser.repository';

/**
 * POST handler pour créer/mettre à jour un GameUser
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      supabaseId: string;
      email: string;
      name?: string;
      avatarUrl?: string;
      provider?: string;
    };

    const { supabaseId, email, name, avatarUrl, provider } = body;

    if (!supabaseId || !email) {
      return NextResponse.json({ error: 'supabaseId and email are required' }, { status: 400 });
    }

    const gameUserRepo = new PrismaGameUserRepository();
    const result = await gameUserRepo.upsert({
      supabaseId,
      email,
      name,
      avatarUrl,
      provider: provider || 'google',
    });

    if (!result.success) {
      console.error('Failed to upsert GameUser:', result.error);
      return NextResponse.json({ error: 'Failed to create/update game user' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    console.error('Game user API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
