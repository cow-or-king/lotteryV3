/**
 * Tests unitaires pour SupabaseAuthService
 * IMPORTANT: Coverage ≥80% requis
 */

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { SupabaseAuthService } from '@/infrastructure/auth/supabase-auth.service';

// Mock du module @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOtp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      setSession: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      refreshSession: vi.fn(),
    },
  })),
}));

describe('SupabaseAuthService', () => {
  let service: SupabaseAuthService;
  let mockSupabase: {
    auth: {
      signUp: Mock;
      signInWithPassword: Mock;
      signInWithOtp: Mock;
      resetPasswordForEmail: Mock;
      updateUser: Mock;
      setSession: Mock;
      signOut: Mock;
      getUser: Mock;
      refreshSession: Mock;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SupabaseAuthService();
    // @ts-expect-error - accessing private property for testing
    mockSupabase = service.supabase;
  });

  describe('signUp', () => {
    it('should return success with AuthUser on valid signup', async () => {
      // ARRANGE
      const email = 'test@example.com';
      const password = 'ValidPass123!';
      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        email_confirmed_at: '2025-01-01T00:00:00Z',
        user_metadata: { name: 'Test User' },
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      // ACT
      const result = await service.signUp(email, password);

      // ASSERT
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(email);
        expect(result.data.emailVerified).toBe(true);
        expect(result.data.metadata).toEqual({ name: 'Test User' });
      }
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });
    });

    it('should return error on invalid email', async () => {
      // ARRANGE
      const email = 'invalid-email';
      const password = 'ValidPass123!';

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid email format' },
      });

      // ACT
      const result = await service.signUp(email, password);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Invalid email format');
      }
    });

    it('should return error on weak password', async () => {
      // ARRANGE
      const email = 'test@example.com';
      const password = '123'; // Too short

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Password should be at least 6 characters' },
      });

      // ACT
      const result = await service.signUp(email, password);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Password should be at least 6 characters');
      }
    });

    it('should return error when user creation fails', async () => {
      // ARRANGE
      const email = 'test@example.com';
      const password = 'ValidPass123!';

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      // ACT
      const result = await service.signUp(email, password);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('User creation failed');
      }
    });

    it('should handle Supabase API errors gracefully', async () => {
      // ARRANGE
      const email = 'test@example.com';
      const password = 'ValidPass123!';

      mockSupabase.auth.signUp.mockRejectedValue(new Error('Network error'));

      // ACT
      const result = await service.signUp(email, password);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Network error');
      }
    });

    it('should handle non-Error exceptions', async () => {
      // ARRANGE
      const email = 'test@example.com';
      const password = 'ValidPass123!';

      mockSupabase.auth.signUp.mockRejectedValue('String error');

      // ACT
      const result = await service.signUp(email, password);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Sign up failed');
      }
    });
  });

  describe('signIn', () => {
    it('should return success with AuthTokens on valid credentials', async () => {
      // ARRANGE
      const email = 'test@example.com';
      const password = 'ValidPass123!';
      const mockSession = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
        expires_in: 3600,
        expires_at: 1234567890,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: null },
        error: null,
      });

      // ACT
      const result = await service.signIn(email, password);

      // ASSERT
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.accessToken).toBe('access-token-123');
        expect(result.data.refreshToken).toBe('refresh-token-123');
        expect(result.data.expiresIn).toBe(3600);
        expect(result.data.expiresAt).toBe(1234567890);
      }
    });

    it('should return error on invalid credentials', async () => {
      // ARRANGE
      const email = 'test@example.com';
      const password = 'WrongPassword';

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials' },
      });

      // ACT
      const result = await service.signIn(email, password);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Invalid login credentials');
      }
    });

    it('should return error when no session is created', async () => {
      // ARRANGE
      const email = 'test@example.com';
      const password = 'ValidPass123!';

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: null,
      });

      // ACT
      const result = await service.signIn(email, password);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('No session created');
      }
    });

    it('should handle API errors', async () => {
      // ARRANGE
      const email = 'test@example.com';
      const password = 'ValidPass123!';

      mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Connection timeout'));

      // ACT
      const result = await service.signIn(email, password);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Connection timeout');
      }
    });

    it('should use default values for missing session properties', async () => {
      // ARRANGE
      const email = 'test@example.com';
      const password = 'ValidPass123!';
      const mockSession = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
        expires_in: null,
        expires_at: null,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: null },
        error: null,
      });

      // ACT
      const result = await service.signIn(email, password);

      // ASSERT
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expiresIn).toBe(3600); // Default value
        expect(result.data.expiresAt).toBeGreaterThan(0); // Default calculated value
      }
    });
  });

  describe('verifyToken', () => {
    it('should return success with AuthUser on valid token', async () => {
      // ARRANGE
      const accessToken = 'valid-token-123';
      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        email_confirmed_at: '2025-01-01T00:00:00Z',
        user_metadata: {},
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // ACT
      const result = await service.verifyToken(accessToken);

      // ASSERT
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.emailVerified).toBe(true);
      }
      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith(accessToken);
    });

    it('should return error on expired token', async () => {
      // ARRANGE
      const accessToken = 'expired-token';

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired' },
      });

      // ACT
      const result = await service.verifyToken(accessToken);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Token expired');
      }
    });

    it('should return error on invalid token', async () => {
      // ARRANGE
      const accessToken = 'invalid-token';

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      // ACT
      const result = await service.verifyToken(accessToken);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Invalid token');
      }
    });

    it('should return error when no user found', async () => {
      // ARRANGE
      const accessToken = 'valid-token-but-no-user';

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // ACT
      const result = await service.verifyToken(accessToken);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('No user found');
      }
    });

    it('should handle API errors', async () => {
      // ARRANGE
      const accessToken = 'valid-token';

      mockSupabase.auth.getUser.mockRejectedValue(new Error('API error'));

      // ACT
      const result = await service.verifyToken(accessToken);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('API error');
      }
    });
  });

  describe('refreshTokens', () => {
    it('should return success with new AuthTokens on valid refresh', async () => {
      // ARRANGE
      const refreshToken = 'valid-refresh-token';
      const mockSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        expires_at: 1234567890,
      };

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // ACT
      const result = await service.refreshTokens(refreshToken);

      // ASSERT
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.accessToken).toBe('new-access-token');
        expect(result.data.refreshToken).toBe('new-refresh-token');
      }
      expect(mockSupabase.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: refreshToken,
      });
    });

    it('should return error on invalid refresh token', async () => {
      // ARRANGE
      const refreshToken = 'invalid-refresh-token';

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid refresh token' },
      });

      // ACT
      const result = await service.refreshTokens(refreshToken);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Invalid refresh token');
      }
    });

    it('should return error when no session is created', async () => {
      // ARRANGE
      const refreshToken = 'valid-refresh-token';

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // ACT
      const result = await service.refreshTokens(refreshToken);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('No session created');
      }
    });

    it('should handle API errors', async () => {
      // ARRANGE
      const refreshToken = 'valid-refresh-token';

      mockSupabase.auth.refreshSession.mockRejectedValue(new Error('Network error'));

      // ACT
      const result = await service.refreshTokens(refreshToken);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Network error');
      }
    });
  });

  describe('sendMagicLink', () => {
    it('should return success on successful magic link send', async () => {
      // ARRANGE
      const email = 'test@example.com';

      mockSupabase.auth.signInWithOtp.mockResolvedValue({
        data: {},
        error: null,
      });

      // ACT
      const result = await service.sendMagicLink(email);

      // ASSERT
      expect(result.success).toBe(true);
      expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });
    });

    it('should return error on failed magic link send', async () => {
      // ARRANGE
      const email = 'test@example.com';

      mockSupabase.auth.signInWithOtp.mockResolvedValue({
        data: {},
        error: { message: 'Email service unavailable' },
      });

      // ACT
      const result = await service.sendMagicLink(email);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Email service unavailable');
      }
    });

    it('should handle API errors', async () => {
      // ARRANGE
      const email = 'test@example.com';

      mockSupabase.auth.signInWithOtp.mockRejectedValue(new Error('Connection error'));

      // ACT
      const result = await service.sendMagicLink(email);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Connection error');
      }
    });
  });

  describe('resetPassword', () => {
    it('should return success on successful password reset email', async () => {
      // ARRANGE
      const email = 'test@example.com';

      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      // ACT
      const result = await service.resetPassword(email);

      // ASSERT
      expect(result.success).toBe(true);
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      });
    });

    it('should return error on failed password reset', async () => {
      // ARRANGE
      const email = 'test@example.com';

      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: { message: 'User not found' },
      });

      // ACT
      const result = await service.resetPassword(email);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('User not found');
      }
    });

    it('should handle API errors', async () => {
      // ARRANGE
      const email = 'test@example.com';

      mockSupabase.auth.resetPasswordForEmail.mockRejectedValue(new Error('API error'));

      // ACT
      const result = await service.resetPassword(email);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('API error');
      }
    });
  });

  describe('updatePassword', () => {
    it('should return success on successful password update', async () => {
      // ARRANGE
      const accessToken = 'valid-token';
      const newPassword = 'NewPassword123!';

      mockSupabase.auth.setSession.mockResolvedValue({
        data: { session: {} },
        error: null,
      });

      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: {} },
        error: null,
      });

      // ACT
      const result = await service.updatePassword(accessToken, newPassword);

      // ASSERT
      expect(result.success).toBe(true);
      expect(mockSupabase.auth.setSession).toHaveBeenCalledWith({
        access_token: accessToken,
        refresh_token: '',
      });
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: newPassword,
      });
    });

    it('should return error on failed password update', async () => {
      // ARRANGE
      const accessToken = 'valid-token';
      const newPassword = '123'; // Too weak

      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Password too weak' },
      });

      // ACT
      const result = await service.updatePassword(accessToken, newPassword);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Password too weak');
      }
    });

    it('should handle API errors', async () => {
      // ARRANGE
      const accessToken = 'valid-token';
      const newPassword = 'NewPassword123!';

      mockSupabase.auth.updateUser.mockRejectedValue(new Error('Network error'));

      // ACT
      const result = await service.updatePassword(accessToken, newPassword);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Network error');
      }
    });
  });

  describe('signOut', () => {
    it('should return success on successful sign out', async () => {
      // ARRANGE
      const accessToken = 'valid-token';

      mockSupabase.auth.setSession.mockResolvedValue({
        data: {},
        error: null,
      });

      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      // ACT
      const result = await service.signOut(accessToken);

      // ASSERT
      expect(result.success).toBe(true);
      expect(mockSupabase.auth.setSession).toHaveBeenCalledWith({
        access_token: accessToken,
        refresh_token: '',
      });
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should return error on failed sign out', async () => {
      // ARRANGE
      const accessToken = 'valid-token';

      mockSupabase.auth.setSession.mockResolvedValue({
        data: {},
        error: null,
      });

      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      // ACT
      const result = await service.signOut(accessToken);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Sign out failed');
      }
    });

    it('should handle API errors', async () => {
      // ARRANGE
      const accessToken = 'valid-token';

      mockSupabase.auth.setSession.mockRejectedValue(new Error('Connection error'));

      // ACT
      const result = await service.signOut(accessToken);

      // ASSERT
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Connection error');
      }
    });
  });

  describe('mapSupabaseUserToAuthUser', () => {
    it('should map email-verified user correctly', async () => {
      // ARRANGE
      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        email_confirmed_at: '2025-01-01T00:00:00Z',
        user_metadata: { name: 'Test User' },
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      // ACT
      const result = await service.signUp('test@example.com', 'password');

      // ASSERT
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.emailVerified).toBe(true);
        expect(result.data.metadata).toEqual({ name: 'Test User' });
      }
    });

    it('should map unverified user correctly', async () => {
      // ARRANGE
      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        email_confirmed_at: null,
        user_metadata: {},
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      // ACT
      const result = await service.signUp('test@example.com', 'password');

      // ASSERT
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.emailVerified).toBe(false);
      }
    });

    it('should handle missing email', async () => {
      // ARRANGE
      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: null,
        email_confirmed_at: null,
        user_metadata: {},
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      // ACT
      const result = await service.signUp('test@example.com', 'password');

      // ASSERT
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('');
      }
    });
  });
});
