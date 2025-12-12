/**
 * Auth Callback Page Tests
 * Tests pour la gestion des callbacks d'authentification
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCallbackPage from './page';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock AnimatedBackground and GlassCard
vi.mock('@/components/ui/AnimatedBackground', () => ({
  AnimatedBackground: () => <div data-testid="animated-background" />,
}));

vi.mock('@/components/ui/GlassCard', () => ({
  GlassCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="glass-card" className={className}>
      {children}
    </div>
  ),
}));

// Mock fetch globalement
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AuthCallbackPage', () => {
  const mockPush = vi.fn();
  const mockSearchParams = new Map();

  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as any).mockReturnValue({
      push: mockPush,
    });

    (useSearchParams as any).mockReturnValue({
      get: (key: string) => mockSearchParams.get(key) ?? null,
    });
  });

  afterEach(() => {
    mockSearchParams.clear();
  });

  it('displays processing state initially', () => {
    mockSearchParams.set('code', 'auth-code-123');

    render(<AuthCallbackPage />);

    expect(screen.getByText('Authentification')).toBeInTheDocument();
    expect(screen.getByText('Vérification en cours...')).toBeInTheDocument();
  });

  it('handles successful authentication with code', async () => {
    mockSearchParams.set('code', 'auth-code-123');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/callback',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: 'auth-code-123' }),
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Succès!')).toBeInTheDocument();
      expect(screen.getByText('Authentification réussie! Redirection...')).toBeInTheDocument();
    });

    // Wait for the redirect to be called
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      },
      { timeout: 2000 },
    );
  });

  it('redirects to custom next URL when provided', async () => {
    mockSearchParams.set('code', 'auth-code-123');
    mockSearchParams.set('next', '/custom-page');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText('Succès!')).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/custom-page');
      },
      { timeout: 2000 },
    );
  });

  it('handles error from URL params', async () => {
    mockSearchParams.set('error', 'access_denied');
    mockSearchParams.set('error_description', 'User cancelled the authentication');

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur')).toBeInTheDocument();
      expect(screen.getByText('User cancelled the authentication')).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      },
      { timeout: 3500 },
    );
  });

  it('handles missing code parameter', async () => {
    // Pas de code fourni
    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur')).toBeInTheDocument();
      expect(screen.getByText("Code d'authentification manquant.")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      },
      { timeout: 3500 },
    );
  });

  it('handles failed API response', async () => {
    mockSearchParams.set('code', 'auth-code-123');
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur')).toBeInTheDocument();
      expect(screen.getByText("Échec de l'authentification. Redirection...")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      },
      { timeout: 3500 },
    );
  });

  it('handles fetch exception', async () => {
    mockSearchParams.set('code', 'auth-code-123');
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur')).toBeInTheDocument();
      expect(screen.getByText("Échec de l'authentification. Redirection...")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      },
      { timeout: 3500 },
    );
  });

  it('renders AnimatedBackground', () => {
    mockSearchParams.set('code', 'auth-code-123');

    render(<AuthCallbackPage />);

    expect(screen.getByTestId('animated-background')).toBeInTheDocument();
  });

  it('renders GlassCard', () => {
    mockSearchParams.set('code', 'auth-code-123');

    render(<AuthCallbackPage />);

    expect(screen.getByTestId('glass-card')).toBeInTheDocument();
  });

  it('displays loading spinner during processing', () => {
    mockSearchParams.set('code', 'auth-code-123');

    const { container } = render(<AuthCallbackPage />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays success icon on successful auth', async () => {
    mockSearchParams.set('code', 'auth-code-123');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { container } = render(<AuthCallbackPage />);

    await waitFor(
      () => {
        const successIcon = container.querySelector('svg path[d*="M5 13l4 4L19 7"]');
        expect(successIcon).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('displays error icon on failed auth', async () => {
    mockSearchParams.set('error', 'access_denied');

    const { container } = render(<AuthCallbackPage />);

    await waitFor(
      () => {
        const errorIcon = container.querySelector('svg path[d*="M6 18L18 6M6 6l12 12"]');
        expect(errorIcon).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });
});
