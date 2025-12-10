/**
 * DashboardTopBar Component
 * Top bar avec bouton toggle sidebar et infos utilisateur
 * IMPORTANT: ZERO any types
 */

'use client';

interface User {
  name?: string | null;
  email?: string | null;
  role?: string | null;
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '30px',
      }}
    >
      {/* User Info Card with integrated toggle button */}
      <div
        style={{
          flex: 1,
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(147, 51, 234, 0.2)',
          borderRadius: '12px',
          padding: 'clamp(12px, 2vw, 16px)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            borderRadius: '10px',
            color: '#4b5563',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            transition: 'all 0.3s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(147, 51, 234, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)';
            e.currentTarget.style.color = '#9333ea';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.2)';
            e.currentTarget.style.color = '#4b5563';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>

        {/* User Avatar */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
          }}
        >
          👤
        </div>

        {/* Colonne gauche: Nom et Email */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 'clamp(13px, 2.5vw, 15px)',
              fontWeight: '600',
              color: '#1f2937',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userLoading ? '...' : user?.name || user?.email?.split('@')[0] || 'Utilisateur'}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 'clamp(10px, 1.8vw, 11px)',
              color: '#6b7280',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userLoading ? '...' : user?.email || ''}
          </p>
        </div>

        {/* Colonne droite: Plan et Limites */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            alignItems: 'flex-end',
            flexShrink: 0,
          }}
        >
          {/* Plan Badge */}
          <div
            style={{
              padding: '4px 12px',
              background: 'rgba(147, 51, 234, 0.15)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              borderRadius: '8px',
              fontSize: 'clamp(10px, 2vw, 12px)',
              color: '#7c3aed',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {userLoading ? '...' : user?.subscription?.plan || 'FREE'}
          </div>

          {/* Store Limit */}
          <div
            style={{
              fontSize: 'clamp(9px, 1.8vw, 10px)',
              color: '#6b7280',
              whiteSpace: 'nowrap',
              textAlign: 'center',
            }}
          >
            {userLoading
              ? '...'
              : `${user?.subscription?.storesLimit || 1} store${(user?.subscription?.storesLimit || 1) > 1 ? 's' : ''}`}
          </div>
        </div>
      </div>
    </div>
  );
}
