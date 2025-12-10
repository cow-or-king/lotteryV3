/**
 * SidebarNavItem Component
 * Item de navigation du sidebar
 * IMPORTANT: ZERO any types
 */

'use client';

import { MenuId } from '@/hooks/dashboard/useSidebar';
import Link from 'next/link';
import { ReactNode, useTransition } from 'react';
import { ShieldCheck, User } from 'lucide-react';

interface SidebarNavItemProps {
  id: MenuId;
  icon: ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  isCompactMode: boolean;
  onItemClick: (menu: MenuId) => void;
  onCloseSidebar: () => void;
  targetRole?: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  currentRole?: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | null;
  adminVisible?: boolean;
  userVisible?: boolean;
}

export function SidebarNavItem({
  id,
  icon,
  label,
  path,
  isActive,
  isCompactMode,
  onItemClick,
  onCloseSidebar,
  targetRole,
  currentRole,
  adminVisible,
  userVisible,
}: SidebarNavItemProps) {
  const [, startTransition] = useTransition();

  // Afficher les badges uniquement si SUPER_ADMIN et le menu est partagé
  const showSharedBadges = currentRole === 'SUPER_ADMIN' && (adminVisible || userVisible);

  return (
    <Link
      href={path}
      prefetch={true}
      onClick={() => {
        startTransition(() => {
          onItemClick(id);
          if (window.innerWidth < 768 && !isCompactMode) {
            onCloseSidebar();
          }
        });
      }}
      title={isCompactMode ? label : ''}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCompactMode ? 'center' : 'flex-start',
        gap: '12px',
        margin: '5px 0',
        padding: isCompactMode ? '10px 8px' : '10px 16px',
        background: isActive ? 'rgba(147, 51, 234, 0.15)' : 'transparent',
        border: isActive
          ? '1px solid rgba(147, 51, 234, 0.3)'
          : showSharedBadges
            ? '2px solid rgba(59, 130, 246, 0.4)'
            : '1px solid transparent',
        borderRadius: '12px',
        color: isActive ? '#9333ea' : '#4b5563',
        cursor: 'pointer',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '15px',
        fontWeight: isActive ? '600' : '500',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(147, 51, 234, 0.08)';
          if (!showSharedBadges) {
            e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.15)';
          }
          e.currentTarget.style.color = '#7c3aed';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = showSharedBadges
            ? 'rgba(59, 130, 246, 0.4)'
            : 'transparent';
          e.currentTarget.style.color = '#4b5563';
        }
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: isCompactMode ? '36px' : '32px',
          height: isCompactMode ? '36px' : '32px',
          background: isActive
            ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)'
            : 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
          border: isActive
            ? '1px solid rgba(147, 51, 234, 0.4)'
            : '1px solid rgba(147, 51, 234, 0.2)',
          borderRadius: '10px',
          transition: 'all 0.3s',
          color: isActive ? '#9333ea' : '#a855f7',
        }}
      >
        {icon}
      </div>
      {!isCompactMode && <span>{label}</span>}
      {isActive && !isCompactMode && (
        <div
          style={{
            position: 'absolute',
            right: '12px',
            width: '4px',
            height: '20px',
            background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
            borderRadius: '2px',
          }}
        />
      )}
      {showSharedBadges && !isCompactMode && (
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
          }}
        >
          {adminVisible && (
            <div
              title="Partagé avec ADMIN"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px',
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '6px',
                color: '#3b82f6',
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          )}
          {userVisible && (
            <div
              title="Partagé avec USER"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '6px',
                color: '#10b981',
              }}
            >
              <User className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
