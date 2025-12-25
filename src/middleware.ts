/**
 * Next.js Middleware
 * Gestion de l'authentification et protection des routes
 * IMPORTANT: ZERO any types
 * NOTE: Ne PAS faire d'appels réseau dans le middleware (Edge Runtime limitations)
 */

import { NextRequest, NextResponse } from 'next/server';

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
 * Cookie names
 */
const ACCESS_TOKEN_COOKIE = 'cb-access-token';
const REFRESH_TOKEN_COOKIE = 'cb-refresh-token';
const GAME_SESSION_COOKIE = 'cb-game-session';

/**
 * Middleware de protection des routes
 * IMPORTANT: Sépare complètement l'auth admin (dashboard) et l'auth jeu (play)
 * Ne vérifie que la présence des cookies, pas leur validité
 * La validation se fait dans le tRPC context (Node.js runtime)
 */
export async function middleware(request: NextRequest) {
  const { pathname, hash } = request.nextUrl;

  // IMPORTANT: Intercepter les redirections OAuth mal configurées
  // Si on arrive sur /dashboard avec access_token ou error dans l'URL/hash
  // => Supabase a redirigé vers /dashboard au lieu de /auth/callback
  if (pathname === '/dashboard') {
    const url = request.nextUrl.clone();
    const hasOAuthParams =
      url.searchParams.has('access_token') ||
      url.searchParams.has('error') ||
      url.searchParams.has('code') ||
      hash.includes('access_token') ||
      hash.includes('error');

    if (hasOAuthParams) {
      // Rediriger vers /auth/callback en préservant tous les params
      url.pathname = '/auth/callback';
      return NextResponse.redirect(url);
    }
  }

  // Vérifier si la route est protégée
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // Vérifier si la route est publique uniquement
  const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.some((route) => pathname.startsWith(route));

  // IMPORTANT: Séparer les cookies admin et game
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const gameSession = request.cookies.get(GAME_SESSION_COOKIE)?.value;

  const hasAdminAuth = !!(accessToken && refreshToken);
  const hasGameAuth = !!gameSession;

  // Redirection pour les routes protégées (ADMIN UNIQUEMENT)
  if (isProtectedRoute && !hasAdminAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Redirection pour les routes publiques uniquement (ADMIN UNIQUEMENT)
  // Si on a une session game, on ne redirige PAS vers dashboard
  if (isPublicOnlyRoute && hasAdminAuth && !hasGameAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Callback d'authentification
  if (pathname === '/auth/callback') {
    // Accepter les callbacks avec ou sans code (implicit flow vs PKCE flow)
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
