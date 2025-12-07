/**
 * Tests unitaires pour SessionService
 * IMPORTANT: Coverage ≥80% requis
 */

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import type { AuthTokens } from '@/infrastructure/auth/supabase-auth.service';
import type { UserId } from '@/shared/types/branded.type';
import { NextRequest } from 'next/server';

// Mock next/headers
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// Mock supabaseAuthService
vi.mock('@/infrastructure/auth/supabase-auth.service', () => ({
  supabaseAuthService: {
    verifyToken: vi.fn(),
    refreshTokens: vi.fn(),
    signOut: vi.fn(),
  },
}));

describe('SessionService', () => {
  let service: ReturnType<
    (typeof import('@/infrastructure/auth/session.service'))['SessionService']
  >;
  let mockSupabaseAuthService: {
    verifyToken: Mock;
    refreshTokens: Mock;
    signOut: Mock;
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import('@/infrastructure/auth/session.service');
    const authModule = await import('@/infrastructure/auth/supabase-auth.service');
    mockSupabaseAuthService = authModule.supabaseAuthService as typeof mockSupabaseAuthService;
    service = new module.SessionService(mockSupabaseAuthService);
  });

  describe('createSession', () => {
    it('should create session with valid tokens', async () => {
      // ARRANGE
      const tokens: AuthTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600,
        expiresAt: 1234567890,
      };
      const userId = '550e8400-e29b-41d4-a716-446655440000' as UserId;

      // ACT
      const result = await service.createSession(tokens, userId);

      // ASSERT
      expect(result.success).toBe(true);
      expect(mockCookieStore.set).toHaveBeenCalledTimes(2);

      // Vérifier ACCESS_TOKEN_COOKIE
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'rl-access-token',
        'access-token-123',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 3600,
        }),
      );

      // Vérifier REFRESH_TOKEN_COOKIE
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'rl-refresh-token',
        'refresh-token-123',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30,
        }),
      );
    });

    it('should handle errors when creating session', async () => {
      // ARRANGE
      const tokens: AuthTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600,
        expiresAt: 1234567890,
      };
      const userId = '550e8400-e29b-41d4-a716-446655440000' as UserId;

      mockCookieStore.set.mockImplementation(() => {
        throw new Error('Cookie storage error');
      });

      // ACT
      const result = await service.createSession(tokens, userId);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Cookie storage error');
      }
    });

    it('should handle non-Error exceptions', async () => {
      // ARRANGE
      const tokens: AuthTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600,
        expiresAt: 1234567890,
      };
      const userId = '550e8400-e29b-41d4-a716-446655440000' as UserId;

      mockCookieStore.set.mockImplementation(() => {
        throw 'String error';
      });

      // ACT
      const result = await service.createSession(tokens, userId);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Failed to create session');
      }
    });
  });

  describe('getSession', () => {
    it('should return session when cookies exist and token is valid', async () => {
      // ARRANGE
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === 'rl-access-token') return { value: 'valid-access-token' };
        if (name === 'rl-refresh-token') return { value: 'valid-refresh-token' };
        return undefined;
      });

      mockSupabaseAuthService.verifyToken.mockResolvedValue({
        success: true,
        data: {
          id: mockUserId as UserId,
          email: 'test@example.com',
          emailVerified: true,
        },
      });

      // ACT
      const result = await service.getSession();

      // ASSERT
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.userId).toBe(mockUserId);
        expect(result.data.accessToken).toBe('valid-access-token');
        expect(result.data.refreshToken).toBe('valid-refresh-token');
        expect(result.data.expiresAt).toBeGreaterThan(Date.now());
      }
    });

    it('should return null when no cookies exist', async () => {
      // ARRANGE
      mockCookieStore.get.mockReturnValue(undefined);

      // ACT
      const result = await service.getSession();

      // ASSERT
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should return null when access token is missing', async () => {
      // ARRANGE
      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === 'rl-refresh-token') return { value: 'valid-refresh-token' };
        return undefined;
      });

      // ACT
      const result = await service.getSession();

      // ASSERT
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should refresh session when token verification fails', async () => {
      // ARRANGE
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === 'rl-access-token') return { value: 'expired-access-token' };
        if (name === 'rl-refresh-token') return { value: 'valid-refresh-token' };
        return undefined;
      });

      // Token vérification échoue
      mockSupabaseAuthService.verifyToken.mockResolvedValue({
        success: false,
        error: new Error('Token expired'),
      });

      // Refresh réussit
      mockSupabaseAuthService.refreshTokens.mockResolvedValue({
        success: true,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600,
          expiresAt: 1234567890,
        },
      });

      // Nouvelle vérification réussit
      mockSupabaseAuthService.verifyToken
        .mockResolvedValueOnce({
          success: false,
          error: new Error('Token expired'),
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            id: mockUserId as UserId,
            email: 'test@example.com',
            emailVerified: true,
          },
        });

      // ACT
      const result = await service.getSession();

      // ASSERT
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.accessToken).toBe('new-access-token');
        expect(result.data.refreshToken).toBe('new-refresh-token');
      }
    });

    it('should return null when refresh fails', async () => {
      // ARRANGE
      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === 'rl-access-token') return { value: 'expired-access-token' };
        if (name === 'rl-refresh-token') return { value: 'invalid-refresh-token' };
        return undefined;
      });

      mockSupabaseAuthService.verifyToken.mockResolvedValue({
        success: false,
        error: new Error('Token expired'),
      });

      mockSupabaseAuthService.refreshTokens.mockResolvedValue({
        success: false,
        error: new Error('Invalid refresh token'),
      });

      // ACT
      const result = await service.getSession();

      // ASSERT
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle errors when getting session', async () => {
      // ARRANGE
      mockCookieStore.get.mockImplementation(() => {
        throw new Error('Cookie read error');
      });

      // ACT
      const result = await service.getSession();

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Cookie read error');
      }
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      // ARRANGE
      const refreshToken = 'valid-refresh-token';
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000';

      mockSupabaseAuthService.refreshTokens.mockResolvedValue({
        success: true,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600,
          expiresAt: 1234567890,
        },
      });

      mockSupabaseAuthService.verifyToken.mockResolvedValue({
        success: true,
        data: {
          id: mockUserId as UserId,
          email: 'test@example.com',
          emailVerified: true,
        },
      });

      // ACT
      const result = await service.refreshSession(refreshToken);

      // ASSERT
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe(mockUserId);
        expect(result.data.accessToken).toBe('new-access-token');
        expect(result.data.refreshToken).toBe('new-refresh-token');
        expect(result.data.expiresAt).toBe(1234567890 * 1000); // Converti en ms
      }
      expect(mockCookieStore.set).toHaveBeenCalled(); // createSession appelé
    });

    it('should return error when refresh fails', async () => {
      // ARRANGE
      const refreshToken = 'invalid-refresh-token';

      mockSupabaseAuthService.refreshTokens.mockResolvedValue({
        success: false,
        error: new Error('Invalid refresh token'),
      });

      // ACT
      const result = await service.refreshSession(refreshToken);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Invalid refresh token');
      }
    });

    it('should return error when token verification fails after refresh', async () => {
      // ARRANGE
      const refreshToken = 'valid-refresh-token';

      mockSupabaseAuthService.refreshTokens.mockResolvedValue({
        success: true,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600,
          expiresAt: 1234567890,
        },
      });

      mockSupabaseAuthService.verifyToken.mockResolvedValue({
        success: false,
        error: new Error('Token verification failed'),
      });

      // ACT
      const result = await service.refreshSession(refreshToken);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Failed to verify refreshed token');
      }
    });

    it('should handle errors during refresh', async () => {
      // ARRANGE
      const refreshToken = 'valid-refresh-token';

      mockSupabaseAuthService.refreshTokens.mockRejectedValue(new Error('Network error'));

      // ACT
      const result = await service.refreshSession(refreshToken);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Network error');
      }
    });
  });

  describe('destroySession', () => {
    it('should destroy session successfully', async () => {
      // ARRANGE
      mockCookieStore.get.mockReturnValue({ value: 'valid-access-token' });
      mockSupabaseAuthService.signOut.mockResolvedValue({
        success: true,
        data: undefined,
      });

      // ACT
      const result = await service.destroySession();

      // ASSERT
      expect(result.success).toBe(true);
      expect(mockSupabaseAuthService.signOut).toHaveBeenCalledWith('valid-access-token');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('rl-access-token');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('rl-refresh-token');
    });

    it('should destroy session even when no access token exists', async () => {
      // ARRANGE
      mockCookieStore.get.mockReturnValue(undefined);

      // ACT
      const result = await service.destroySession();

      // ASSERT
      expect(result.success).toBe(true);
      expect(mockSupabaseAuthService.signOut).not.toHaveBeenCalled();
      expect(mockCookieStore.delete).toHaveBeenCalledTimes(2);
    });

    it('should handle errors when destroying session', async () => {
      // ARRANGE
      mockCookieStore.get.mockReturnValue({ value: 'valid-access-token' });
      mockSupabaseAuthService.signOut.mockRejectedValue(new Error('Sign out error'));

      // ACT
      const result = await service.destroySession();

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Sign out error');
      }
    });

    it('should handle non-Error exceptions', async () => {
      // ARRANGE
      mockCookieStore.get.mockImplementation(() => {
        throw 'String error';
      });

      // ACT
      const result = await service.destroySession();

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Failed to destroy session');
      }
    });
  });

  describe('hasValidSession', () => {
    it('should return true when access token is valid', async () => {
      // ARRANGE
      const request = {
        cookies: {
          get: vi.fn((name: string) => {
            if (name === 'rl-access-token') return { value: 'valid-access-token' };
            if (name === 'rl-refresh-token') return { value: 'valid-refresh-token' };
            return undefined;
          }),
        },
      } as unknown as NextRequest;

      mockSupabaseAuthService.verifyToken.mockResolvedValue({
        success: true,
        data: {
          id: 'user-123' as UserId,
          email: 'test@example.com',
          emailVerified: true,
        },
      });

      // ACT
      const result = await service.hasValidSession(request);

      // ASSERT
      expect(result).toBe(true);
    });

    it('should return false when no cookies exist', async () => {
      // ARRANGE
      const request = {
        cookies: {
          get: vi.fn(() => undefined),
        },
      } as unknown as NextRequest;

      // ACT
      const result = await service.hasValidSession(request);

      // ASSERT
      expect(result).toBe(false);
    });

    it('should refresh token when access token is invalid', async () => {
      // ARRANGE
      const request = {
        cookies: {
          get: vi.fn((name: string) => {
            if (name === 'rl-access-token') return { value: 'expired-access-token' };
            if (name === 'rl-refresh-token') return { value: 'valid-refresh-token' };
            return undefined;
          }),
        },
      } as unknown as NextRequest;

      mockSupabaseAuthService.verifyToken.mockResolvedValue({
        success: false,
        error: new Error('Token expired'),
      });

      mockSupabaseAuthService.refreshTokens.mockResolvedValue({
        success: true,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600,
          expiresAt: 1234567890,
        },
      });

      // ACT
      const result = await service.hasValidSession(request);

      // ASSERT
      expect(result).toBe(true);
      expect(mockSupabaseAuthService.refreshTokens).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should return false when refresh fails', async () => {
      // ARRANGE
      const request = {
        cookies: {
          get: vi.fn((name: string) => {
            if (name === 'rl-access-token') return { value: 'expired-access-token' };
            if (name === 'rl-refresh-token') return { value: 'invalid-refresh-token' };
            return undefined;
          }),
        },
      } as unknown as NextRequest;

      mockSupabaseAuthService.verifyToken.mockResolvedValue({
        success: false,
        error: new Error('Token expired'),
      });

      mockSupabaseAuthService.refreshTokens.mockResolvedValue({
        success: false,
        error: new Error('Invalid refresh token'),
      });

      // ACT
      const result = await service.hasValidSession(request);

      // ASSERT
      expect(result).toBe(false);
    });
  });
});
