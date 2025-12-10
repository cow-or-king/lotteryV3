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
  Star,
  Store,
  Target,
  TrendingUp,
  Users,
  Settings,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { usePermissions } from '@/lib/rbac/usePermissions';
import { getVisibleMenusForRole } from '@/lib/rbac/menuConfig';
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

  // Filtrer les menus visibles selon le rôle
  const visibleMenus = useMemo(() => {
    const menus = getVisibleMenusForRole(role);
    return menus.map((menu) => {
      const IconComponent = ICON_MAP[menu.icon as keyof typeof ICON_MAP];
      return {
        id: menu.id as MenuId,
        icon: IconComponent ? <IconComponent className="w-5 h-5" /> : null,
        label: menu.label,
        path: menu.path,
      };
    });
  }, [role]);

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
