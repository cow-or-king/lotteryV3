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

// Helper functions to compute styles
function getLinkPadding(isCompactMode: boolean): string {
  return isCompactMode ? '10px 8px' : '10px 16px';
}

function getLinkJustifyContent(isCompactMode: boolean): string {
  return isCompactMode ? 'center' : 'flex-start';
}

function getLinkBackground(isActive: boolean): string {
  return isActive ? 'rgba(147, 51, 234, 0.15)' : 'transparent';
}

function getLinkBorder(isActive: boolean, showSharedBadges: boolean): string {
  if (isActive) {
    return '1px solid rgba(147, 51, 234, 0.3)';
  }
  if (showSharedBadges) {
    return '2px solid rgba(59, 130, 246, 0.4)';
  }
  return '1px solid transparent';
}

function getLinkColor(isActive: boolean): string {
  return isActive ? '#9333ea' : '#4b5563';
}

function getLinkFontWeight(isActive: boolean): string {
  return isActive ? '600' : '500';
}

function getIconSize(isCompactMode: boolean): string {
  return isCompactMode ? '36px' : '32px';
}

function getIconBackground(isActive: boolean): string {
  return isActive
    ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)'
    : 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)';
}

function getIconBorder(isActive: boolean): string {
  return isActive ? '1px solid rgba(147, 51, 234, 0.4)' : '1px solid rgba(147, 51, 234, 0.2)';
}

function getIconColor(isActive: boolean): string {
  return isActive ? '#9333ea' : '#a855f7';
}

function getHoverBorderColor(showSharedBadges: boolean): string {
  return showSharedBadges ? 'rgba(59, 130, 246, 0.4)' : 'transparent';
}

function shouldCloseSidebar(isCompactMode: boolean): boolean {
  return window.innerWidth < 768 && !isCompactMode;
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
  currentRole,
  adminVisible,
  userVisible,
}: SidebarNavItemProps) {
  const [, startTransition] = useTransition();

  // Compute all values upfront
  const showSharedBadges =
    currentRole === 'SUPER_ADMIN' && ((adminVisible ?? false) || (userVisible ?? false));
  const linkTitle = isCompactMode ? label : '';
  const linkPadding = getLinkPadding(isCompactMode);
  const linkJustifyContent = getLinkJustifyContent(isCompactMode);
  const linkBackground = getLinkBackground(isActive);
  const linkBorder = getLinkBorder(isActive, showSharedBadges);
  const linkColor = getLinkColor(isActive);
  const linkFontWeight = getLinkFontWeight(isActive);
  const iconSize = getIconSize(isCompactMode);
  const iconBackground = getIconBackground(isActive);
  const iconBorder = getIconBorder(isActive);
  const iconColor = getIconColor(isActive);
  const hoverBorderColor = getHoverBorderColor(showSharedBadges);
  const showLabel = !isCompactMode;
  const showActiveIndicator = isActive && !isCompactMode;
  const showBadges = showSharedBadges && !isCompactMode;

  const handleClick = () => {
    startTransition(() => {
      onItemClick(id);
      if (shouldCloseSidebar(isCompactMode)) {
        onCloseSidebar();
      }
    });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isActive) {
      return;
    }
    e.currentTarget.style.background = 'rgba(147, 51, 234, 0.08)';
    if (!showSharedBadges) {
      e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.15)';
    }
    e.currentTarget.style.color = '#7c3aed';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isActive) {
      return;
    }
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.borderColor = hoverBorderColor;
    e.currentTarget.style.color = '#4b5563';
  };

  return (
    <Link
      href={path}
      prefetch={true}
      onClick={handleClick}
      title={linkTitle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: linkJustifyContent,
        gap: '12px',
        margin: '5px 0',
        padding: linkPadding,
        background: linkBackground,
        border: linkBorder,
        borderRadius: '12px',
        color: linkColor,
        cursor: 'pointer',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '15px',
        fontWeight: linkFontWeight,
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        textDecoration: 'none',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: iconSize,
          height: iconSize,
          background: iconBackground,
          border: iconBorder,
          borderRadius: '10px',
          transition: 'all 0.3s',
          color: iconColor,
        }}
      >
        {icon}
      </div>
      {showLabel && <span>{label}</span>}
      {showActiveIndicator && (
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
      {showBadges && (
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
