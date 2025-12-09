/**
 * DashboardSidebar Component
 * Sidebar du dashboard avec navigation et menu utilisateur
 * IMPORTANT: ZERO any types
 */

'use client';

import { MenuId } from '@/hooks/dashboard/useSidebar';
import {
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
import { useState } from 'react';
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

const menuItems = [
  {
    id: 'dashboard' as MenuId,
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: 'Dashboard',
    path: '/dashboard',
  },
  {
    id: 'stores' as MenuId,
    icon: <Store className="w-5 h-5" />,
    label: 'Mes Commerces',
    path: '/dashboard/stores',
  },
  {
    id: 'reviews' as MenuId,
    icon: <Star className="w-5 h-5" />,
    label: 'Avis Google',
    path: '/dashboard/reviews',
  },
  {
    id: 'prizes' as MenuId,
    icon: <Gift className="w-5 h-5" />,
    label: 'Gains & Lots',
    path: '/dashboard/prizes',
  },
  {
    id: 'campaigns' as MenuId,
    icon: <Target className="w-5 h-5" />,
    label: 'Campagnes',
    path: '/campaigns',
  },
  {
    id: 'lottery' as MenuId,
    icon: <Dices className="w-5 h-5" />,
    label: 'Lottery',
    path: '/lottery',
  },
  {
    id: 'participants' as MenuId,
    icon: <Users className="w-5 h-5" />,
    label: 'Participants',
    path: '/participants',
  },
  {
    id: 'analytics' as MenuId,
    icon: <TrendingUp className="w-5 h-5" />,
    label: 'Analytics',
    path: '/analytics',
  },
  {
    id: 'settings' as MenuId,
    icon: <Settings className="w-5 h-5" />,
    label: 'Paramètres',
    path: '/settings',
  },
];

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
        {menuItems.map((item) => (
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
