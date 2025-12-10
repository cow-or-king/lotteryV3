/**
 * RBAC - Role-Based Access Control
 * Système de permissions par rôle
 * IMPORTANT: ZERO any types
 */

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export type Feature =
  // Super Admin only
  | 'ai-config'
  | 'user-management'
  | 'platform-stats'
  | 'client-management'
  // Admin + Super Admin
  | 'stores'
  | 'brands'
  | 'campaigns'
  | 'prizes'
  | 'reviews'
  | 'ai-suggestions'
  // User + Admin + Super Admin
  | 'view-reviews'
  | 'view-stats';

interface User {
  readonly id: string;
  readonly role: UserRole;
}

/**
 * Matrice de permissions par rôle
 */
const ROLE_PERMISSIONS: Record<UserRole, readonly Feature[]> = {
  SUPER_ADMIN: [
    // Super Admin a accès à TOUT
    'ai-config',
    'user-management',
    'platform-stats',
    'client-management',
    'stores',
    'brands',
    'campaigns',
    'prizes',
    'reviews',
    'ai-suggestions',
    'view-reviews',
    'view-stats',
  ],
  ADMIN: [
    // Admin gère ses commerces et campagnes
    'stores',
    'brands',
    'campaigns',
    'prizes',
    'reviews',
    'ai-suggestions',
    'view-reviews',
    'view-stats',
  ],
  USER: [
    // User lecture seule
    'view-reviews',
    'view-stats',
  ],
};

/**
 * Vérifie si un utilisateur a accès à une fonctionnalité
 * @param user - Utilisateur avec son rôle
 * @param feature - Fonctionnalité à vérifier
 * @returns true si l'utilisateur a accès
 */
export function canAccess(user: User, feature: Feature): boolean {
  const permissions = ROLE_PERMISSIONS[user.role];
  return permissions.includes(feature);
}

/**
 * Vérifie si un utilisateur est Super Admin
 */
export function isSuperAdmin(user: User): boolean {
  return user.role === 'SUPER_ADMIN';
}

/**
 * Vérifie si un utilisateur est au moins Admin
 */
export function isAdmin(user: User): boolean {
  return user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
}

/**
 * Récupère toutes les permissions d'un utilisateur
 */
export function getUserPermissions(user: User): readonly Feature[] {
  return ROLE_PERMISSIONS[user.role];
}
