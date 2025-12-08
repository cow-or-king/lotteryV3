/**
 * Tests d'intégration pour auth.router
 * IMPORTANT: Coverage ≥80% requis
 * Tests des endpoints tRPC end-to-end
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { UserId } from '@/lib/types/branded.type';
import type { PrismaClient } from '@/generated/prisma';

// Mock Supabase Auth Service
vi.mock('@/infrastructure/auth/supabase-auth.service', () => ({
  supabaseAuthService: {
    signUp: vi.fn(),
    signIn: vi.fn(),
    sendMagicLink: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    signOut: vi.fn(),
    verifyToken: vi.fn(),
  },
}));

// Mock Session Service
vi.mock('@/infrastructure/auth/session.service', () => ({
  sessionService: {
    createSession: vi.fn(),
    destroySession: vi.fn(),
    refreshSession: vi.fn(),
  },
}));

// Mock Prisma with comprehensive methods
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn().mockResolvedValue({
      id: 'user-default',
      email: 'default@example.com',
      name: 'Default User',
      emailVerified: false,
      hashedPassword: 'hashed',
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    delete: vi.fn(),
    count: vi.fn().mockResolvedValue(0), // Default: email doesn't exist
  },
  subscription: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn().mockResolvedValue({
      id: 'sub-default',
      userId: 'user-default',
      plan: 'FREE',
      status: 'ACTIVE',
      storesLimit: 1,
      campaignsLimit: 1,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    count: vi.fn(),
  },
  store: {
    count: vi.fn().mockResolvedValue(0),
  },
  campaign: {
    count: vi.fn().mockResolvedValue(0),
  },
  $transaction: vi.fn((callback) => callback(mockPrisma)),
} as unknown as PrismaClient;

describe('auth.router (Integration Tests)', () => {
  let caller: ReturnType<typeof import('@/server/api/root').appRouter.createCaller>;
  let mockSupabaseAuthService: {
    signUp: ReturnType<typeof vi.fn>;
    signIn: ReturnType<typeof vi.fn>;
    sendMagicLink: ReturnType<typeof vi.fn>;
    resetPassword: ReturnType<typeof vi.fn>;
    updatePassword: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    verifyToken: ReturnType<typeof vi.fn>;
  };
  let mockSessionService: {
    createSession: ReturnType<typeof vi.fn>;
    destroySession: ReturnType<typeof vi.fn>;
    refreshSession: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Re-configure default Prisma mocks after clearAllMocks
    mockPrisma.user.count = vi.fn().mockResolvedValue(0);
    mockPrisma.user.upsert = vi.fn().mockResolvedValue({
      id: 'user-default',
      email: 'default@example.com',
      name: 'Default User',
      emailVerified: false,
      hashedPassword: 'hashed',
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockPrisma.subscription.upsert = vi.fn().mockResolvedValue({
      id: 'sub-default',
      userId: 'user-default',
      plan: 'FREE',
      status: 'ACTIVE',
      storesLimit: 1,
      campaignsLimit: 1,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockPrisma.store.count = vi.fn().mockResolvedValue(0);
    mockPrisma.campaign.count = vi.fn().mockResolvedValue(0);

    // Import modules to get mocked services
    const authModule = await import('@/infrastructure/auth/supabase-auth.service');
    const sessionModule = await import('@/infrastructure/auth/session.service');
    const routerModule = await import('@/server/api/root');
    const trpcModule = await import('@/server/api/trpc');

    mockSupabaseAuthService = authModule.supabaseAuthService as typeof mockSupabaseAuthService;
    mockSessionService = sessionModule.sessionService as typeof mockSessionService;

    // Créer un contexte de test
    const ctx = trpcModule.createInnerTRPCContext({
      userId: null,
      accessToken: null,
      refreshToken: null,
      prisma: mockPrisma,
    });

    caller = routerModule.appRouter.createCaller(ctx);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // ARRANGE
      const input = {
        email: 'newuser@example.com',
        password: 'StrongPass123!',
        name: 'New User',
      };

      const mockUserId = '550e8400-e29b-41d4-a716-446655440000' as UserId;

      // Mock Supabase signUp
      mockSupabaseAuthService.signUp.mockResolvedValue({
        success: true,
        data: {
          id: mockUserId,
          email: input.email,
          emailVerified: false,
        },
      });

      // Mock email existence check (user doesn't exist yet)
      mockPrisma.user.count = vi.fn().mockResolvedValue(0);

      // Mock Prisma user upsert (used by repository.save())
      mockPrisma.user.upsert = vi.fn().mockResolvedValue({
        id: mockUserId,
        email: input.email,
        name: input.name,
        emailVerified: false,
        hashedPassword: 'handled-by-supabase',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock Prisma subscription upsert (used by subscription repository)
      mockPrisma.subscription.upsert = vi.fn().mockResolvedValue({
        id: 'sub-123',
        userId: mockUserId,
        plan: 'FREE',
        status: 'ACTIVE',
        storesLimit: 1,
        campaignsLimit: 1,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // ACT
      const result = await caller.auth.register(input);

      // ASSERT
      expect(result.success).toBe(true);
      expect(result.data.email).toBe(input.email);
      expect(result.data.name).toBe(input.name);
      expect(mockSupabaseAuthService.signUp).toHaveBeenCalledWith(input.email, input.password);
      expect(mockPrisma.user.count).toHaveBeenCalled();
    });

    it('should return error on invalid email', async () => {
      // ARRANGE
      const input = {
        email: 'invalid-email',
        password: 'StrongPass123!',
      };

      // ACT & ASSERT
      await expect(caller.auth.register(input)).rejects.toThrow();
    });

    it('should return error on weak password', async () => {
      // ARRANGE
      const input = {
        email: 'test@example.com',
        password: '123',
      };

      // ACT & ASSERT
      await expect(caller.auth.register(input)).rejects.toThrow();
    });

    it('should handle Supabase signup failure', async () => {
      // ARRANGE
      const input = {
        email: 'test@example.com',
        password: 'StrongPass123!',
      };

      mockSupabaseAuthService.signUp.mockResolvedValue({
        success: false,
        error: new Error('Email already exists'),
      });

      // ACT & ASSERT
      await expect(caller.auth.register(input)).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // ARRANGE
      const input = {
        email: 'test@example.com',
        password: 'StrongPass123!',
      };

      const mockUserId = '550e8400-e29b-41d4-a716-446655440000' as UserId;
      const mockTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600,
        expiresAt: 1234567890,
      };

      // Mock Supabase signIn
      mockSupabaseAuthService.signIn.mockResolvedValue({
        success: true,
        data: mockTokens,
      });

      // Mock Supabase verifyToken
      mockSupabaseAuthService.verifyToken.mockResolvedValue({
        success: true,
        data: {
          id: mockUserId,
          email: input.email,
          emailVerified: true,
        },
      });

      // Mock Prisma user lookup
      mockPrisma.user.findUnique = vi.fn().mockResolvedValue({
        id: mockUserId,
        email: input.email,
        emailVerified: true,
      });

      // Mock session creation
      mockSessionService.createSession.mockResolvedValue({
        success: true,
        data: undefined,
      });

      // ACT
      const result = await caller.auth.login(input);

      // ASSERT
      expect(result.success).toBe(true);
      expect(result.data.email).toBe(input.email);
      expect(result.data.emailVerified).toBe(true);
      expect(mockSupabaseAuthService.signIn).toHaveBeenCalledWith(input.email, input.password);
      expect(mockSessionService.createSession).toHaveBeenCalledWith(mockTokens, mockUserId);
    });

    it('should return error on invalid credentials', async () => {
      // ARRANGE
      const input = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      mockSupabaseAuthService.signIn.mockResolvedValue({
        success: false,
        error: new Error('Invalid credentials'),
      });

      // ACT & ASSERT
      await expect(caller.auth.login(input)).rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('should create user if exists in Supabase but not in DB', async () => {
      // ARRANGE
      const input = {
        email: 'test@example.com',
        password: 'StrongPass123!',
      };

      const mockUserId = '550e8400-e29b-41d4-a716-446655440000' as UserId;
      const mockTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600,
        expiresAt: 1234567890,
      };

      mockSupabaseAuthService.signIn.mockResolvedValue({
        success: true,
        data: mockTokens,
      });

      mockSupabaseAuthService.verifyToken.mockResolvedValue({
        success: true,
        data: {
          id: mockUserId,
          email: input.email,
          emailVerified: true,
        },
      });

      // User not found in DB
      mockPrisma.user.findUnique = vi.fn().mockResolvedValue(null);

      // Mock email existence check (user doesn't exist yet)
      mockPrisma.user.count = vi.fn().mockResolvedValue(0);

      // Mock user upsert for creation
      mockPrisma.user.upsert = vi.fn().mockResolvedValue({
        id: mockUserId,
        email: input.email,
        name: null,
        emailVerified: true,
        hashedPassword: 'handled-by-supabase',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock subscription upsert
      mockPrisma.subscription.upsert = vi.fn().mockResolvedValue({
        id: 'sub-123',
        userId: mockUserId,
        plan: 'FREE',
        status: 'ACTIVE',
        storesLimit: 1,
        campaignsLimit: 1,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockSessionService.createSession.mockResolvedValue({
        success: true,
        data: undefined,
      });

      // ACT
      const result = await caller.auth.login(input);

      // ASSERT
      expect(result.success).toBe(true);
      expect(mockPrisma.user.upsert).toHaveBeenCalled();
    });

    it('should handle session creation failure', async () => {
      // ARRANGE
      const input = {
        email: 'test@example.com',
        password: 'StrongPass123!',
      };

      const mockUserId = '550e8400-e29b-41d4-a716-446655440000' as UserId;

      mockSupabaseAuthService.signIn.mockResolvedValue({
        success: true,
        data: {
          accessToken: 'token',
          refreshToken: 'refresh',
          expiresIn: 3600,
          expiresAt: 1234567890,
        },
      });

      mockSupabaseAuthService.verifyToken.mockResolvedValue({
        success: true,
        data: {
          id: mockUserId,
          email: input.email,
          emailVerified: true,
        },
      });

      mockPrisma.user.findUnique = vi.fn().mockResolvedValue({
        id: mockUserId,
        email: input.email,
      });

      mockSessionService.createSession.mockResolvedValue({
        success: false,
        error: new Error('Cookie error'),
      });

      // ACT & ASSERT
      await expect(caller.auth.login(input)).rejects.toThrow('Failed to create session');
    });
  });

  describe('getMe', () => {
    it('should return current user when authenticated', async () => {
      // ARRANGE
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000' as UserId;

      // Import modules
      const routerModule = await import('@/server/api/root');
      const trpcModule = await import('@/server/api/trpc');

      // Créer un contexte authentifié
      const ctx = trpcModule.createInnerTRPCContext({
        userId: mockUserId,
        accessToken: 'valid-token',
        refreshToken: 'valid-refresh',
        prisma: mockPrisma,
      });

      const authenticatedCaller = routerModule.appRouter.createCaller(ctx);

      mockPrisma.user.findUnique = vi.fn().mockResolvedValue({
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        hashedPassword: 'hashed-password',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // ACT
      const result = await authenticatedCaller.auth.getMe();

      // ASSERT
      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
      expect(result?.name).toBe('Test User');
    });

    it('should return null when not authenticated', async () => {
      // ACT
      const result = await caller.auth.getMe();

      // ASSERT
      expect(result).toBeNull();
    });

    it('should return null when user not found in DB', async () => {
      // ARRANGE
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000' as UserId;

      const routerModule = await import('@/server/api/root');
      const trpcModule = await import('@/server/api/trpc');

      const ctx = trpcModule.createInnerTRPCContext({
        userId: mockUserId,
        accessToken: 'valid-token',
        refreshToken: 'valid-refresh',
        prisma: mockPrisma,
      });

      const authenticatedCaller = routerModule.appRouter.createCaller(ctx);

      mockPrisma.user.findUnique = vi.fn().mockResolvedValue(null);

      // ACT
      const result = await authenticatedCaller.auth.getMe();

      // ASSERT
      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // ARRANGE
      mockSessionService.destroySession.mockResolvedValue({
        success: true,
        data: undefined,
      });

      // ACT
      const result = await caller.auth.logout();

      // ASSERT
      expect(result.success).toBe(true);
      expect(result.message).toBe('Déconnexion réussie');
      expect(mockSessionService.destroySession).toHaveBeenCalled();
    });

    it('should handle logout failure', async () => {
      // ARRANGE
      mockSessionService.destroySession.mockResolvedValue({
        success: false,
        error: new Error('Session destroy failed'),
      });

      // ACT & ASSERT
      await expect(caller.auth.logout()).rejects.toThrow('Failed to logout');
    });
  });

  describe('sendMagicLink', () => {
    it('should send magic link successfully', async () => {
      // ARRANGE
      const input = { email: 'test@example.com' };

      mockSupabaseAuthService.sendMagicLink.mockResolvedValue({
        success: true,
        data: undefined,
      });

      // ACT
      const result = await caller.auth.sendMagicLink(input);

      // ASSERT
      expect(result.success).toBe(true);
      expect(result.message).toBe('Magic link envoyé. Vérifiez votre boîte mail.');
      expect(mockSupabaseAuthService.sendMagicLink).toHaveBeenCalledWith(input.email);
    });

    it('should handle magic link send failure', async () => {
      // ARRANGE
      const input = { email: 'test@example.com' };

      mockSupabaseAuthService.sendMagicLink.mockResolvedValue({
        success: false,
        error: new Error('Email service unavailable'),
      });

      // ACT & ASSERT
      await expect(caller.auth.sendMagicLink(input)).rejects.toThrow('Email service unavailable');
    });

    it('should validate email format', async () => {
      // ARRANGE
      const input = { email: 'invalid-email' };

      // ACT & ASSERT
      await expect(caller.auth.sendMagicLink(input)).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      // ARRANGE
      const input = { email: 'test@example.com' };

      mockSupabaseAuthService.resetPassword.mockResolvedValue({
        success: true,
        data: undefined,
      });

      // ACT
      const result = await caller.auth.resetPassword(input);

      // ASSERT
      expect(result.success).toBe(true);
      expect(result.message).toBe('Email de réinitialisation envoyé.');
      expect(mockSupabaseAuthService.resetPassword).toHaveBeenCalledWith(input.email);
    });

    it('should handle reset password failure', async () => {
      // ARRANGE
      const input = { email: 'test@example.com' };

      mockSupabaseAuthService.resetPassword.mockResolvedValue({
        success: false,
        error: new Error('User not found'),
      });

      // ACT & ASSERT
      await expect(caller.auth.resetPassword(input)).rejects.toThrow('User not found');
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully when authenticated', async () => {
      // ARRANGE
      const input = { newPassword: 'NewStrongPass123!' };
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000' as UserId;
      const mockAccessToken = 'valid-access-token';

      const routerModule = await import('@/server/api/root');
      const trpcModule = await import('@/server/api/trpc');

      const ctx = trpcModule.createInnerTRPCContext({
        userId: mockUserId,
        accessToken: mockAccessToken,
        refreshToken: 'valid-refresh',
        prisma: mockPrisma,
      });

      const authenticatedCaller = routerModule.appRouter.createCaller(ctx);

      mockSupabaseAuthService.updatePassword.mockResolvedValue({
        success: true,
        data: undefined,
      });

      // ACT
      const result = await authenticatedCaller.auth.updatePassword(input);

      // ASSERT
      expect(result.success).toBe(true);
      expect(result.message).toBe('Mot de passe mis à jour avec succès.');
      expect(mockSupabaseAuthService.updatePassword).toHaveBeenCalledWith(
        mockAccessToken,
        input.newPassword,
      );
    });

    it('should reject when not authenticated', async () => {
      // ARRANGE
      const input = { newPassword: 'NewStrongPass123!' };

      // ACT & ASSERT
      await expect(caller.auth.updatePassword(input)).rejects.toThrow('UNAUTHORIZED');
    });

    it('should validate password strength', async () => {
      // ARRANGE
      const input = { newPassword: '123' };
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000' as UserId;

      const routerModule = await import('@/server/api/root');
      const trpcModule = await import('@/server/api/trpc');

      const ctx = trpcModule.createInnerTRPCContext({
        userId: mockUserId,
        accessToken: 'valid-token',
        refreshToken: 'valid-refresh',
        prisma: mockPrisma,
      });

      const authenticatedCaller = routerModule.appRouter.createCaller(ctx);

      // ACT & ASSERT
      await expect(authenticatedCaller.auth.updatePassword(input)).rejects.toThrow();
    });

    it('should handle update password failure', async () => {
      // ARRANGE
      const input = { newPassword: 'NewStrongPass123!' };
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000' as UserId;

      const routerModule = await import('@/server/api/root');
      const trpcModule = await import('@/server/api/trpc');

      const ctx = trpcModule.createInnerTRPCContext({
        userId: mockUserId,
        accessToken: 'valid-token',
        refreshToken: 'valid-refresh',
        prisma: mockPrisma,
      });

      const authenticatedCaller = routerModule.appRouter.createCaller(ctx);

      mockSupabaseAuthService.updatePassword.mockResolvedValue({
        success: false,
        error: new Error('Password too weak'),
      });

      // ACT & ASSERT
      await expect(authenticatedCaller.auth.updatePassword(input)).rejects.toThrow(
        'Password too weak',
      );
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      // ARRANGE
      const mockRefreshToken = 'valid-refresh-token';
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000' as UserId;

      const routerModule = await import('@/server/api/root');
      const trpcModule = await import('@/server/api/trpc');

      const ctx = trpcModule.createInnerTRPCContext({
        userId: null,
        accessToken: null,
        refreshToken: mockRefreshToken,
        prisma: mockPrisma,
      });

      const callerWithRefresh = routerModule.appRouter.createCaller(ctx);

      mockSessionService.refreshSession.mockResolvedValue({
        success: true,
        data: {
          userId: mockUserId,
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresAt: 1234567890,
        },
      });

      // ACT
      const result = await callerWithRefresh.auth.refreshSession();

      // ASSERT
      expect(result.success).toBe(true);
      expect(result.data.userId).toBe(mockUserId);
      expect(mockSessionService.refreshSession).toHaveBeenCalledWith(mockRefreshToken);
    });

    it('should reject when no refresh token', async () => {
      // ACT & ASSERT
      await expect(caller.auth.refreshSession()).rejects.toThrow('No refresh token');
    });

    it('should handle refresh failure', async () => {
      // ARRANGE
      const mockRefreshToken = 'invalid-refresh-token';

      const routerModule = await import('@/server/api/root');
      const trpcModule = await import('@/server/api/trpc');

      const ctx = trpcModule.createInnerTRPCContext({
        userId: null,
        accessToken: null,
        refreshToken: mockRefreshToken,
        prisma: mockPrisma,
      });

      const callerWithRefresh = routerModule.appRouter.createCaller(ctx);

      mockSessionService.refreshSession.mockResolvedValue({
        success: false,
        error: new Error('Invalid refresh token'),
      });

      // ACT & ASSERT
      await expect(callerWithRefresh.auth.refreshSession()).rejects.toThrow(
        'Failed to refresh session',
      );
    });
  });
});
