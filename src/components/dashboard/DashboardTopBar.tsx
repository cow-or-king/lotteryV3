/**
 * DashboardTopBar Component
 * Top bar avec bouton toggle sidebar et infos utilisateur
 * IMPORTANT: ZERO any types
 */

'use client';

interface User {
  name?: string | null;
  email?: string | null;
  subscription?: {
    plan?: string | null;
    storesLimit?: number | null;
  } | null;
}

interface DashboardTopBarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  user: User | undefined | null;
  userLoading: boolean;
}

export function DashboardTopBar({
  isSidebarOpen,
  toggleSidebar,
  user,
  userLoading,
}: DashboardTopBarProps) {
  return (
    <div className="flex items-center gap-3 mb-8 relative">
      {/* User Info Card with integrated toggle button */}
      <div className="flex-1 bg-white/40 backdrop-blur-xl border border-purple-600/20 rounded-xl p-3 sm:p-4 flex items-center gap-3 relative">
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 bg-white/60 backdrop-blur-md border border-purple-600/20 rounded-lg text-gray-600 cursor-pointer flex items-center justify-center text-lg transition-all shrink-0 hover:bg-purple-600/15 hover:border-purple-600/30 hover:text-purple-600 hover:scale-105"
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>

        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center text-lg shrink-0">
          👤
        </div>

        {/* Colonne gauche: Nom et Email */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <p className="m-0 text-xs sm:text-sm md:text-base font-semibold text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap">
            {userLoading ? '...' : user?.name || user?.email?.split('@')[0] || 'Utilisateur'}
          </p>
          <p className="m-0 text-[10px] sm:text-xs text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
            {userLoading ? '...' : user?.email || ''}
          </p>
        </div>

        {/* Colonne droite: Plan et Limites */}
        <div className="flex flex-col gap-1.5 items-end shrink-0">
          {/* Plan Badge */}
          <div className="py-1 px-3 bg-purple-600/15 border border-purple-600/30 rounded-lg text-[10px] sm:text-xs text-purple-600 font-semibold text-center">
            {userLoading ? '...' : user?.subscription?.plan || 'FREE'}
          </div>

          {/* Store Limit */}
          <div className="text-[9px] sm:text-[10px] text-gray-600 whitespace-nowrap text-center">
            {userLoading
              ? '...'
              : `${user?.subscription?.storesLimit || 1} store${(user?.subscription?.storesLimit || 1) > 1 ? 's' : ''}`}
          </div>
        </div>
      </div>
    </div>
  );
}
