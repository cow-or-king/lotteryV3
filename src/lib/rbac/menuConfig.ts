/**
 * Configuration des menus et leur visibilité par rôle
 * TODO: Migrer vers la base de données (MenuPermission)
 * IMPORTANT: ZERO any types
 */

import { UserRole } from './permissions';

export interface MenuConfig {
  id: string;
  label: string;
  path: string;
  icon: string;
  superAdminVisible: boolean;
  adminVisible: boolean;
  userVisible: boolean;
  displayOrder: number;
  targetRole?: 'SUPER_ADMIN' | 'ADMIN' | 'USER'; // Indique le rôle propriétaire de ce menu
}

/**
 * Configuration par défaut des menus
 * SUPER_ADMIN a quelques pages exclusives (/dashboard/super-admin, home, analytics, settings)
 * Pour le reste, il active les routes ADMIN si besoin
 * ADMIN/USER ont leurs propres pages (ex: /dashboard)
 */
export const DEFAULT_MENU_CONFIG: MenuConfig[] = [
  // === MENUS SUPER_ADMIN EXCLUSIFS (pages séparées) ===
  {
    id: 'super-admin',
    label: 'Super Admin',
    path: '/dashboard/super-admin',
    icon: 'Crown',
    superAdminVisible: true,
    adminVisible: false,
    userVisible: false,
    displayOrder: 0,
    targetRole: 'SUPER_ADMIN',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard/super-admin/home',
    icon: 'LayoutDashboard',
    superAdminVisible: true,
    adminVisible: false,
    userVisible: false,
    displayOrder: 1,
    targetRole: 'SUPER_ADMIN',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/dashboard/super-admin/analytics',
    icon: 'TrendingUp',
    superAdminVisible: true,
    adminVisible: false,
    userVisible: false,
    displayOrder: 2,
    targetRole: 'SUPER_ADMIN',
  },
  {
    id: 'settings',
    label: 'Paramètres',
    path: '/dashboard/super-admin/settings',
    icon: 'Settings',
    superAdminVisible: true,
    adminVisible: false,
    userVisible: false,
    displayOrder: 3,
    targetRole: 'SUPER_ADMIN',
  },

  // === MENUS ADMIN (pages séparées des SUPER_ADMIN) ===
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    superAdminVisible: false, // Peut être activé par le SUPER_ADMIN dans la config
    adminVisible: true,
    userVisible: false,
    displayOrder: 4,
    targetRole: 'ADMIN',
  },
  {
    id: 'admin-stores',
    label: 'Mes Commerces',
    path: '/dashboard/stores',
    icon: 'Store',
    superAdminVisible: false, // Peut être activé par le SUPER_ADMIN dans la config
    adminVisible: true,
    userVisible: false,
    displayOrder: 5,
    targetRole: 'ADMIN',
  },
  {
    id: 'admin-reviews',
    label: 'Avis Google',
    path: '/dashboard/reviews',
    icon: 'Star',
    superAdminVisible: false, // Peut être activé par le SUPER_ADMIN dans la config
    adminVisible: true,
    userVisible: false,
    displayOrder: 6,
    targetRole: 'ADMIN',
  },
  {
    id: 'admin-prizes',
    label: 'Gains & Lots',
    path: '/dashboard/prizes',
    icon: 'Gift',
    superAdminVisible: false, // Peut être activé par le SUPER_ADMIN dans la config
    adminVisible: true,
    userVisible: false,
    displayOrder: 7,
    targetRole: 'ADMIN',
  },
];

/**
 * Filtrer les menus visibles pour un rôle donné
 */
export function getVisibleMenusForRole(role: UserRole | null): MenuConfig[] {
  if (!role) {
    return [];
  }

  return DEFAULT_MENU_CONFIG.filter((menu) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return menu.superAdminVisible;
      case 'ADMIN':
        return menu.adminVisible;
      case 'USER':
        return menu.userVisible;
      default:
        return false;
    }
  }).sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Vérifier si un menu est visible pour un rôle
 */
export function isMenuVisibleForRole(menuId: string, role: UserRole | null): boolean {
  if (!role) {
    return false;
  }

  const menu = DEFAULT_MENU_CONFIG.find((m) => m.id === menuId);
  if (!menu) {
    return false;
  }

  switch (role) {
    case 'SUPER_ADMIN':
      return menu.superAdminVisible;
    case 'ADMIN':
      return menu.adminVisible;
    case 'USER':
      return menu.userVisible;
    default:
      return false;
  }
}
