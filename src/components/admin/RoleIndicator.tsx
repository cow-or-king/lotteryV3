/**
 * Role Indicator Component
 * Badge compact dans la TopBar pour afficher et changer de rôle (SUPER_ADMIN uniquement)
 * IMPORTANT: ZERO any types
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { UserRole } from '@/lib/rbac/permissions';
import { Crown, Shield, User } from 'lucide-react';

interface RoleIndicatorProps {
  currentRole: UserRole;
  realRole: UserRole;
  isImpersonating: boolean;
  isSuperAdmin: boolean;
  onRoleChange: (role: UserRole) => void;
}

export function RoleIndicator({
  currentRole,
  realRole,
  isImpersonating,
  isSuperAdmin,
  onRoleChange,
}: RoleIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ne rien afficher si pas SUPER_ADMIN
  if (!isSuperAdmin) return null;

  const roleConfig = {
    SUPER_ADMIN: {
      icon: Crown,
      label: 'Super Admin',
      color: '#dc2626',
      bgColor: 'rgba(220, 38, 38, 0.1)',
      borderColor: 'rgba(220, 38, 38, 0.3)',
    },
    ADMIN: {
      icon: Shield,
      label: 'Admin',
      color: '#9333ea',
      bgColor: 'rgba(147, 51, 234, 0.1)',
      borderColor: 'rgba(147, 51, 234, 0.3)',
    },
    USER: {
      icon: User,
      label: 'User',
      color: '#2563eb',
      bgColor: 'rgba(37, 99, 235, 0.1)',
      borderColor: 'rgba(37, 99, 235, 0.3)',
    },
  };

  const current = roleConfig[currentRole];
  const Icon = current.icon;

  const roles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'USER'];

  return (
    <div style={{ position: 'relative' }}>
      {/* Badge cliquable */}
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: current.bgColor,
          border: `1px solid ${current.borderColor}`,
          borderRadius: '8px',
          color: current.color,
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = `0 0 0 2px ${current.borderColor}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Icon size={14} />
        <span>{current.label}</span>
        {isImpersonating && <span style={{ fontSize: '10px' }}>👁️</span>}
        <span style={{ fontSize: '10px' }}>▼</span>
      </button>

      {/* Dropdown qui s'ouvre vers le haut */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            padding: '8px',
            minWidth: '180px',
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid rgba(147, 51, 234, 0.1)',
              marginBottom: '8px',
            }}
          >
            <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>
              MODE TEST
            </p>
            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af' }}>
              Rôle réel: {roleConfig[realRole].label}
            </p>
          </div>

          {/* Liste des rôles */}
          {roles.map((role) => {
            const config = roleConfig[role];
            const RoleIcon = config.icon;
            const isActive = currentRole === role;

            return (
              <button
                key={role}
                onClick={() => {
                  onRoleChange(role);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: isActive ? config.bgColor : 'transparent',
                  border: isActive ? `1px solid ${config.borderColor}` : '1px solid transparent',
                  borderRadius: '8px',
                  color: isActive ? config.color : '#4b5563',
                  fontSize: '12px',
                  fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '4px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(147, 51, 234, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <RoleIcon size={14} />
                <span style={{ flex: 1 }}>{config.label}</span>
                {isActive && <span style={{ fontSize: '12px' }}>✓</span>}
              </button>
            );
          })}

          {/* Warning */}
          <div
            style={{
              marginTop: '8px',
              padding: '8px',
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: '6px',
              fontSize: '10px',
              color: '#92400e',
              lineHeight: '1.3',
            }}
          >
            ⚠️ Simule les permissions localement. Rechargement auto.
          </div>
        </div>
      )}
    </div>
  );
}
