/**
 * Dashboard Layout
 * Layout partagé pour toutes les pages du dashboard
 * Contient la sidebar et le wrapper principal
 */

'use client';

import { AnimatedBackground } from '@/components/features/dashboard/AnimatedBackground';
import { DashboardSidebar } from '@/components/features/dashboard/DashboardSidebar';
import { DashboardTopBar } from '@/components/features/dashboard/DashboardTopBar';
import { Toaster } from '@/components/ui/toaster';
import { useDashboardUser } from '@/hooks/dashboard/useDashboardUser';
import { useSidebar } from '@/hooks/dashboard/useSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Hooks personnalisés pour la logique
  const { isSidebarOpen, isCompactMode, activeMenu, setActiveMenu, toggleSidebar, closeSidebar } =
    useSidebar();
  const { user, userLoading, isLoggingOut, handleLogout } = useDashboardUser();

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'white',
        position: 'relative',
      }}
    >
      {/* Blobs animés */}
      <AnimatedBackground />

      {/* Overlay pour mobile quand sidebar est ouverte */}
      {isSidebarOpen && !isCompactMode && (
        <div
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            display: 'none',
          }}
          className="mobile-overlay"
        />
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
        style={{
          flex: 1,
          marginLeft: isSidebarOpen ? (isCompactMode ? '80px' : '280px') : '0',
          padding: '15px',
          paddingLeft: isSidebarOpen ? '0' : '15px',
          paddingRight: isSidebarOpen ? '5px' : '15px',
          overflowY: 'auto',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Content wrapper avec gradient et coins arrondis */}
        <div
          style={{
            minHeight: 'calc(100vh - 40px)',
            background: 'linear-gradient(135deg, #faf5ff 0%, #fdf2f8 50%, #eff6ff 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: 'clamp(16px, 3vw, 20px)',
            border: '1px solid rgba(147, 51, 234, 0.1)',
          }}
          className="dashboard-content-wrapper"
        >
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

      {/* CSS pour responsive et animations */}
      <style jsx global>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        html {
          height: -webkit-fill-available;
          background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 50%, #eff6ff 100%);
        }

        body {
          min-height: 100vh;
          min-height: -webkit-fill-available;
          background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 50%, #eff6ff 100%);
        }

        @media (max-width: 374px) {
          .dashboard-content-wrapper {
            border-radius: 12px !important;
            padding: 12px !important;
          }
        }

        @media (max-width: 768px) {
          .mobile-overlay {
            display: block !important;
          }

          .toggle-compact-btn {
            display: none !important;
          }

          .dashboard-content-wrapper {
            border-radius: 16px !important;
          }
        }

        @media (min-width: 769px) and (max-width: 834px) {
          .mobile-overlay {
            display: none !important;
          }

          .dashboard-content-wrapper {
            border-radius: 20px !important;
          }
        }

        @media (min-width: 835px) and (max-width: 1024px) {
          .mobile-overlay {
            display: none !important;
          }

          .dashboard-content-wrapper {
            border-radius: 24px !important;
          }
        }

        @media (min-width: 1025px) {
          .mobile-overlay {
            display: none !important;
          }
        }

        @media (min-width: 1920px) {
          .dashboard-content-wrapper {
            max-width: 1800px;
            margin: 0 auto;
          }
        }

        @media (max-width: 768px) and (orientation: landscape) {
          .dashboard-content-wrapper {
            border-radius: 12px !important;
            padding: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
