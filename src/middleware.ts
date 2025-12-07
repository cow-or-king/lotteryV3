/**
 * Next.js Middleware
 * Gestion de l'authentification et protection des routes
 * IMPORTANT: ZERO any types
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '@/infrastructure/auth/session.service';

/**
 * Routes protégées qui nécessitent une authentification
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/stores',
  '/campaigns',
  '/lottery',
  '/profile',
  '/settings',
];

/**
 * Routes publiques uniquement (rediriger si connecté)
 */
const PUBLIC_ONLY_ROUTES = ['/login', '/register'];

/**
 * Middleware de protection des routes
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si la route est protégée
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // Vérifier si la route est publique uniquement
  const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.some((route) => pathname.startsWith(route));

  // Vérifier la session
  const hasSession = await sessionService.hasValidSession(request);

  // Redirection pour les routes protégées
  if (isProtectedRoute && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Redirection pour les routes publiques uniquement
  if (isPublicOnlyRoute && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Callback d'authentification (magic link, reset password, etc.)
  if (pathname === '/auth/callback') {
    const url = request.nextUrl.clone();
    const code = url.searchParams.get('code');

    if (!code) {
      url.pathname = '/login';
      url.searchParams.delete('code');
      url.searchParams.delete('next');
      url.searchParams.set('error', 'Invalid authentication code');
      return NextResponse.redirect(url);
    }

    // Le code sera traité côté client
    return NextResponse.next();
  }

  return NextResponse.next();
}

/**
 * Configuration du middleware
 * Spécifie sur quelles routes le middleware doit s'exécuter
 */
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt (metadata files)
     * - Images et assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)',
  ],
};
