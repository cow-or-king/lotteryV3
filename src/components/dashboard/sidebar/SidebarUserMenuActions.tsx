/**
 * SidebarUserMenuActions Component
 * Actions du menu utilisateur (Réglages, Déconnexion)
 * IMPORTANT: ZERO any types
 */

'use client';

import { MenuId } from '@/hooks/dashboard/useSidebar';
import { Loader2, Settings } from 'lucide-react';
import Link from 'next/link';
import { useTransition } from 'react';

interface SidebarUserMenuActionsProps {
  isLoggingOut: boolean;
  onLogout: () => Promise<void>;
  onSettingsClick: (menu: MenuId) => void;
}

export function SidebarUserMenuActions({
  isLoggingOut,
  onLogout,
  onSettingsClick,
}: SidebarUserMenuActionsProps) {
  const [, startTransition] = useTransition();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      {/* Bouton Réglages */}
      <Link
        href="/settings"
        onClick={() => {
          startTransition(() => {
            onSettingsClick('settings');
          });
        }}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'rgba(147, 51, 234, 0.1)',
          border: '1px solid rgba(147, 51, 234, 0.2)',
          borderRadius: '8px',
          color: '#7c3aed',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '13px',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(147, 51, 234, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(147, 51, 234, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.2)';
        }}
      >
        <Settings className="w-4 h-4" />
        Réglages
      </Link>

      {/* Bouton Déconnexion */}
      <button
        onClick={onLogout}
        disabled={isLoggingOut}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#dc2626',
          cursor: isLoggingOut ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          fontSize: '13px',
          opacity: isLoggingOut ? 0.5 : 1,
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        onMouseEnter={(e) => {
          if (!isLoggingOut) {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoggingOut) {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }
        }}
      >
        {isLoggingOut ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Déconnexion...
          </>
        ) : (
          <>🚪 Se déconnecter</>
        )}
      </button>
    </div>
  );
}
