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
 * Helper: Vérifie si la requête contient des paramètres OAuth
 */
function hasOAuthParameters(url: URL, hash: string): boolean {
  return (
    url.searchParams.has('access_token') ||
    url.searchParams.has('error') ||
    url.searchParams.has('code') ||
    hash.includes('access_token') ||
    hash.includes('error')
  );
}

/**
 * Helper: Vérifie si la route est protégée
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Helper: Vérifie si la route est publique uniquement
 */
function isPublicOnlyRoute(pathname: string): boolean {
  return PUBLIC_ONLY_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Helper: Extrait les cookies d'authentification
 */
function getAuthCookies(request: NextRequest): {
  hasAdminAuth: boolean;
  hasGameAuth: boolean;
} {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const gameSession = request.cookies.get(GAME_SESSION_COOKIE)?.value;

  return {
    hasAdminAuth: !!(accessToken && refreshToken),
    hasGameAuth: !!gameSession,
  };
}

/**
 * Helper: Gère la redirection OAuth mal configurée
 */
function handleOAuthRedirect(request: NextRequest, hash: string): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (pathname !== '/dashboard') {
    return null;
  }

  const url = request.nextUrl.clone();
  if (!hasOAuthParameters(url, hash)) {
    return null;
  }

  // Rediriger vers /auth/callback en préservant tous les params
  url.pathname = '/auth/callback';
  return NextResponse.redirect(url);
}

/**
 * Helper: Gère les routes protégées
 */
function handleProtectedRoute(
  pathname: string,
  hasAdminAuth: boolean,
  request: NextRequest,
): NextResponse | null {
  if (!isProtectedRoute(pathname) || hasAdminAuth) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('from', pathname);
  return NextResponse.redirect(url);
}

/**
 * Helper: Gère les routes publiques uniquement
 */
function handlePublicOnlyRoute(
  pathname: string,
  hasAdminAuth: boolean,
  hasGameAuth: boolean,
  request: NextRequest,
): NextResponse | null {
  if (!isPublicOnlyRoute(pathname) || !hasAdminAuth || hasGameAuth) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = '/dashboard';
  return NextResponse.redirect(url);
}

/**
 * Middleware de protection des routes
 * IMPORTANT: Sépare complètement l'auth admin (dashboard) et l'auth jeu (play)
 * Ne vérifie que la présence des cookies, pas leur validité
 * La validation se fait dans le tRPC context (Node.js runtime)
 */
export async function middleware(request: NextRequest) {
  const { pathname, hash } = request.nextUrl;

  // IMPORTANT: Intercepter les redirections OAuth mal configurées
  const oauthRedirect = handleOAuthRedirect(request, hash);
  if (oauthRedirect) {
    return oauthRedirect;
  }

  // Callback d'authentification - laisser passer
  if (pathname === '/auth/callback') {
    return NextResponse.next();
  }

  // Extraire les informations d'authentification
  const { hasAdminAuth, hasGameAuth } = getAuthCookies(request);

  // Vérifier les routes protégées
  const protectedRedirect = handleProtectedRoute(pathname, hasAdminAuth, request);
  if (protectedRedirect) {
    return protectedRedirect;
  }

  // Vérifier les routes publiques uniquement
  const publicOnlyRedirect = handlePublicOnlyRoute(pathname, hasAdminAuth, hasGameAuth, request);
  if (publicOnlyRedirect) {
    return publicOnlyRedirect;
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
