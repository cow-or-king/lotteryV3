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
}

/**
 * Configuration par défaut des menus
 * Cette configuration sera remplacée par les données de la BD ultérieurement
 */
export const DEFAULT_MENU_CONFIG: MenuConfig[] = [
  {
    id: 'super-admin',
    label: 'Super Admin',
    path: '/dashboard/super-admin',
    icon: 'Crown',
    superAdminVisible: true,
    adminVisible: false,
    userVisible: false,
    displayOrder: 0,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    superAdminVisible: true,
    adminVisible: true,
    userVisible: true,
    displayOrder: 1,
  },
  {
    id: 'stores',
    label: 'Mes Commerces',
    path: '/dashboard/stores',
    icon: 'Store',
    superAdminVisible: true,
    adminVisible: true,
    userVisible: false, // USER ne peut pas gérer de commerces
    displayOrder: 2,
  },
  {
    id: 'reviews',
    label: 'Avis Google',
    path: '/dashboard/reviews',
    icon: 'Star',
    superAdminVisible: true,
    adminVisible: true,
    userVisible: false, // USER ne peut pas voir les avis
    displayOrder: 3,
  },
  {
    id: 'prizes',
    label: 'Gains & Lots',
    path: '/dashboard/prizes',
    icon: 'Gift',
    superAdminVisible: true,
    adminVisible: true,
    userVisible: false,
    displayOrder: 4,
  },
  {
    id: 'campaigns',
    label: 'Campagnes',
    path: '/campaigns',
    icon: 'Target',
    superAdminVisible: true,
    adminVisible: false, // Désactivé pour l'instant
    userVisible: false,
    displayOrder: 5,
  },
  {
    id: 'lottery',
    label: 'Lottery',
    path: '/lottery',
    icon: 'Dices',
    superAdminVisible: true,
    adminVisible: false, // Désactivé pour l'instant
    userVisible: false,
    displayOrder: 6,
  },
  {
    id: 'participants',
    label: 'Participants',
    path: '/participants',
    icon: 'Users',
    superAdminVisible: true,
    adminVisible: false, // Désactivé pour l'instant
    userVisible: false,
    displayOrder: 7,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: 'TrendingUp',
    superAdminVisible: true,
    adminVisible: false, // Désactivé pour l'instant
    userVisible: false,
    displayOrder: 8,
  },
  {
    id: 'settings',
    label: 'Paramètres',
    path: '/settings',
    icon: 'Settings',
    superAdminVisible: true,
    adminVisible: false, // Désactivé pour l'instant
    userVisible: false,
    displayOrder: 9,
  },
];

/**
 * Filtrer les menus visibles pour un rôle donné
 */
export function getVisibleMenusForRole(role: UserRole | null): MenuConfig[] {
  if (!role) return [];

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
  if (!role) return false;

  const menu = DEFAULT_MENU_CONFIG.find((m) => m.id === menuId);
  if (!menu) return false;

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
