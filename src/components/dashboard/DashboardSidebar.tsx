/**
 * DashboardSidebar Component
 * Sidebar du dashboard avec navigation et menu utilisateur
 * IMPORTANT: ZERO any types
 */

'use client';

import { MenuId } from '@/hooks/dashboard/useSidebar';
import {
  Crown,
  Dices,
  Gift,
  LayoutDashboard,
  QrCode,
  Star,
  Store,
  Target,
  TrendingUp,
  Users,
  Settings,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { usePermissions } from '@/lib/rbac/usePermissions';
import { DEFAULT_MENU_CONFIG, MenuConfig } from '@/lib/rbac/menuConfig';
import { api } from '@/lib/trpc/client';
import {
  SidebarLogo,
  SidebarNavItem,
  SidebarUserInfo,
  SidebarUserMenuActions,
  SidebarUserMenuCompact,
} from './sidebar';

interface User {
  name?: string | null;
  email?: string | null;
  subscription?: {
    plan?: string | null;
    storesLimit?: number | null;
  } | null;
}

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  isCompactMode: boolean;
  activeMenu: MenuId;
  setActiveMenu: (menu: MenuId) => void;
  closeSidebar: () => void;
  user: User | undefined | null;
  userLoading: boolean;
  isLoggingOut: boolean;
  handleLogout: () => Promise<void>;
}

// Mapping des icônes
const ICON_MAP = {
  Crown: Crown,
  LayoutDashboard: LayoutDashboard,
  Store: Store,
  Star: Star,
  Gift: Gift,
  QrCode: QrCode,
  Target: Target,
  Dices: Dices,
  Users: Users,
  TrendingUp: TrendingUp,
  Settings: Settings,
};

export function DashboardSidebar({
  isSidebarOpen,
  isCompactMode,
  activeMenu,
  setActiveMenu,
  closeSidebar,
  user,
  userLoading,
  isLoggingOut,
  handleLogout,
}: DashboardSidebarProps) {
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(false);
  const { role } = usePermissions();

  // Charger les permissions depuis la DB
  const { data: dbPermissions } = api.menu.getPermissions.useQuery(undefined, {
    // Ne charger que si l'utilisateur est SUPER_ADMIN ou a un rôle
    enabled: !!role,
    // Réessayer en cas d'erreur pour s'assurer que les permissions sont chargées
    retry: 2,
  });

  // Filtrer les menus visibles selon le rôle et les permissions de la DB
  const visibleMenus = useMemo(() => {
    if (!role) {
      return [];
    }

    // Merger DEFAULT_MENU_CONFIG avec les permissions de la DB
    let menuConfig: MenuConfig[] = DEFAULT_MENU_CONFIG;

    if (dbPermissions && dbPermissions.length > 0) {
      // Appliquer les permissions depuis la DB
      menuConfig = DEFAULT_MENU_CONFIG.map((menu) => {
        const dbPerm = dbPermissions.find((p) => p.menuId === menu.id);
        return dbPerm
          ? {
              ...menu,
              superAdminVisible: dbPerm.superAdminVisible,
              adminVisible: dbPerm.adminVisible,
              userVisible: dbPerm.userVisible,
              displayOrder: dbPerm.displayOrder,
            }
          : menu;
      });
    }

    // Filtrer selon le rôle
    const filteredMenus = menuConfig
      .filter((menu) => {
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
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);

    // Mapper avec les icônes
    return filteredMenus.map((menu) => {
      const IconComponent = ICON_MAP[menu.icon as keyof typeof ICON_MAP];
      return {
        id: menu.id as MenuId,
        icon: IconComponent ? <IconComponent className="w-5 h-5" /> : null,
        label: menu.label,
        path: menu.path,
        targetRole: menu.targetRole,
        adminVisible: menu.adminVisible,
        userVisible: menu.userVisible,
      };
    });
  }, [role, dbPermissions]);

  return (
    <div
      style={{
        width: isCompactMode ? '80px' : '280px',
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        minHeight: '-webkit-fill-available',
        left: isSidebarOpen ? 0 : isCompactMode ? '-80px' : '-280px',
        top: 0,
        bottom: 0,
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 50,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <SidebarLogo isCompactMode={isCompactMode} />

      {/* Navigation */}
      <nav
        style={{ flex: 1, padding: isCompactMode ? '20px 8px' : '20px 12px', overflowY: 'auto' }}
      >
        {visibleMenus.map((item) => (
          <SidebarNavItem
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={activeMenu === item.id}
            isCompactMode={isCompactMode}
            onItemClick={setActiveMenu}
            onCloseSidebar={closeSidebar}
            targetRole={item.targetRole}
            currentRole={role}
            adminVisible={item.adminVisible}
            userVisible={item.userVisible}
          />
        ))}
      </nav>

      {/* User section */}
      <div
        style={{
          padding: isCompactMode ? '12px 8px' : '20px',
          borderTop: '1px solid rgba(147, 51, 234, 0.15)',
          background: 'rgba(255, 255, 255, 0.2)',
          marginBottom: '28px',
        }}
      >
        {!isCompactMode ? (
          <>
            <SidebarUserInfo
              user={user}
              userLoading={userLoading}
              isExpanded={isUserMenuExpanded}
              onToggle={() => setIsUserMenuExpanded(!isUserMenuExpanded)}
            />

            {isUserMenuExpanded && (
              <SidebarUserMenuActions
                isLoggingOut={isLoggingOut}
                onLogout={handleLogout}
                onSettingsClick={setActiveMenu}
              />
            )}
          </>
        ) : (
          <SidebarUserMenuCompact isLoggingOut={isLoggingOut} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}
