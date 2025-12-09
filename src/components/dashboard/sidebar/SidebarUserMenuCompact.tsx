/**
 * SidebarUserMenuCompact Component
 * Menu utilisateur en mode compact
 * IMPORTANT: ZERO any types
 */

import { Loader2 } from 'lucide-react';

interface SidebarUserMenuCompactProps {
  isLoggingOut: boolean;
  onLogout: () => Promise<void>;
}

export function SidebarUserMenuCompact({ isLoggingOut, onLogout }: SidebarUserMenuCompactProps) {
  return (
    <button
      onClick={onLogout}
      disabled={isLoggingOut}
      title="Se déconnecter"
      style={{
        width: '100%',
        padding: '10px',
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        color: '#dc2626',
        cursor: isLoggingOut ? 'not-allowed' : 'pointer',
        fontWeight: '600',
        fontSize: '18px',
        opacity: isLoggingOut ? 0.5 : 1,
        transition: 'all 0.3s',
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
      {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : '🚪'}
    </button>
  );
}
