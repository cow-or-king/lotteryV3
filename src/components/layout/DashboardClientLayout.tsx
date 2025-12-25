/**
 * Dashboard Client Layout
 * Layout partagé pour toutes les pages du dashboard
 * Contient la sidebar et le wrapper principal
 * Client component wrapped by server layout
 */

'use client';

import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { DashboardLayoutWrapper } from '@/components/layout/DashboardLayoutWrapper';
import { Toaster } from '@/components/ui/toaster';
import { useDashboardUser } from '@/hooks/dashboard/useDashboardUser';
import { useSidebar } from '@/hooks/dashboard/useSidebar';

export function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  // Hooks personnalisés pour la logique
  const { isSidebarOpen, isCompactMode, activeMenu, setActiveMenu, toggleSidebar, closeSidebar } =
    useSidebar();
  const { user, userLoading, isLoggingOut, handleLogout } = useDashboardUser();

  return (
    <DashboardLayoutWrapper>
      <div className="flex min-h-screen bg-white relative">
        {/* Overlay pour mobile quand sidebar est ouverte */}
        {isSidebarOpen && !isCompactMode && (
          <div onClick={closeSidebar} className="mobile-overlay" />
        )}

        {/* Sidebar */}
        <DashboardSidebar
          isSidebarOpen={isSidebarOpen}
          isCompactMode={isCompactMode}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          closeSidebar={closeSidebar}
          user={user}
          userLoading={userLoading}
          isLoggingOut={isLoggingOut}
          handleLogout={handleLogout}
        />

        {/* Main Content */}
        <div
          className="flex-1 p-[15px] overflow-y-auto transition-all duration-150 ease-out"
          style={{
            marginLeft: isSidebarOpen ? (isCompactMode ? '80px' : '280px') : '0',
            paddingLeft: isSidebarOpen ? '0' : '15px',
            paddingRight: isSidebarOpen ? '5px' : '15px',
          }}
        >
          {/* Content wrapper avec gradient et coins arrondis */}
          <div className="dashboard-content-wrapper">
            {/* Top Bar */}
            <DashboardTopBar
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              user={user}
              userLoading={userLoading}
            />

            {/* Page Content */}
            {children}
          </div>
        </div>

        {/* Toaster pour les notifications */}
        <Toaster />
      </div>
    </DashboardLayoutWrapper>
  );
}
