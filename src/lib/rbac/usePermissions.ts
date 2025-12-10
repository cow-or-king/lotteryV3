/**
 * Hook React pour vérifier les permissions utilisateur
 * Supporte l'impersonation pour les SUPER_ADMIN
 * IMPORTANT: ZERO any types
 */

'use client';

import { api } from '@/lib/trpc/client';
import { canAccess, isSuperAdmin, isAdmin, getUserPermissions, type Feature } from './permissions';
import { useRoleImpersonation } from './RoleImpersonationProvider';

export function usePermissions() {
  const { data: user } = api.auth.getMe.useQuery();
  const { impersonatedRole, isImpersonating } = useRoleImpersonation();

  // Si l'utilisateur n'est pas SUPER_ADMIN, l'impersonation n'a aucun effet
  const effectiveRole =
    user && isSuperAdmin(user) && impersonatedRole ? impersonatedRole : (user?.role ?? null);

  // Créer un user "virtuel" avec le rôle effectif pour les checks de permissions
  const effectiveUser = user && effectiveRole ? { ...user, role: effectiveRole } : user;

  return {
    /**
     * Vérifie si l'utilisateur a accès à une fonctionnalité
     */
    canAccess: (feature: Feature): boolean => {
      if (!effectiveUser) return false;
      return canAccess(effectiveUser, feature);
    },

    /**
     * Vérifie si l'utilisateur est Super Admin
     * Note: Retourne false si en mode impersonation avec un rôle inférieur
     */
    isSuperAdmin: (): boolean => {
      if (!effectiveUser) return false;
      return isSuperAdmin(effectiveUser);
    },

    /**
     * Vérifie si l'utilisateur est au moins Admin
     */
    isAdmin: (): boolean => {
      if (!effectiveUser) return false;
      return isAdmin(effectiveUser);
    },

    /**
     * Récupère toutes les permissions de l'utilisateur
     */
    getPermissions: (): readonly Feature[] => {
      if (!effectiveUser) return [];
      return getUserPermissions(effectiveUser);
    },

    /**
     * Rôle actuel de l'utilisateur (prend en compte l'impersonation)
     */
    role: effectiveRole,

    /**
     * Rôle réel de l'utilisateur (ignore l'impersonation)
     */
    realRole: user?.role ?? null,

    /**
     * Est-ce que l'utilisateur est en mode impersonation ?
     */
    isImpersonating,

    /**
     * Rôle impersoné (null si pas d'impersonation)
     */
    impersonatedRole,
  };
}
