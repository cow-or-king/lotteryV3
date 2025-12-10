/**
 * SidebarUserInfo Component
 * Carte d'information utilisateur cliquable
 * IMPORTANT: ZERO any types
 */

'use client';

import { RoleBadge } from '@/components/admin/RoleBadge';

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
        {/* Role Badge */}
        {!userLoading && (
          <div style={{ flexShrink: 0 }}>
            <RoleBadge />
          </div>
        )}
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
