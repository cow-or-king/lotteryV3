/**
 * SidebarUserInfo Component
 * Carte d'information utilisateur cliquable
 * IMPORTANT: ZERO any types
 */

interface User {
  name?: string | null;
  email?: string | null;
  subscription?: {
    plan?: string | null;
    storesLimit?: number | null;
  } | null;
}

interface SidebarUserInfoProps {
  user: User | undefined | null;
  userLoading: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export function SidebarUserInfo({ user, userLoading, isExpanded, onToggle }: SidebarUserInfoProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: isExpanded ? '8px' : '0',
        border: `1px solid rgba(147, 51, 234, ${isExpanded ? '0.4' : '0.2'})`,
        cursor: 'pointer',
        transition: 'all 0.3s',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
        e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
        e.currentTarget.style.borderColor = `rgba(147, 51, 234, ${isExpanded ? '0.4' : '0.2'})`;
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
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
              fontSize: '14px',
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
              fontSize: '11px',
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
            gap: '4px',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: '2px 8px',
              background: 'rgba(147, 51, 234, 0.15)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              borderRadius: '6px',
              fontSize: '10px',
              color: '#7c3aed',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {userLoading ? '...' : user?.subscription?.plan || 'FREE'}
          </div>
          <div
            style={{
              fontSize: '9px',
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
        {/* Icône chevron */}
        <div
          style={{
            fontSize: '12px',
            color: '#6b7280',
            transition: 'transform 0.3s',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          ▼
        </div>
      </div>
    </button>
  );
}
