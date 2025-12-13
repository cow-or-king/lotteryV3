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
  if (!isSuperAdmin) {
    return null;
  }

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
    <div className="relative">
      {/* Badge cliquable */}
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap hover:scale-105"
        style={{
          background: current.bgColor,
          border: `1px solid ${current.borderColor}`,
          color: current.color,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${current.borderColor}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Icon size={14} />
        <span>{current.label}</span>
        {isImpersonating && <span className="text-[10px]">👁️</span>}
        <span className="text-[10px]">▼</span>
      </button>

      {/* Dropdown qui s'ouvre vers le haut */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute bottom-[calc(100%+8px)] left-0 bg-white/98 backdrop-blur-xl border border-purple-600/20 rounded-xl shadow-lg shadow-black/10 p-2 min-w-[180px] z-[9999]"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-purple-600/10 mb-2">
            <p className="m-0 text-[11px] text-gray-600 font-semibold">MODE TEST</p>
            <p className="m-0 text-[10px] text-gray-400">Rôle réel: {roleConfig[realRole].label}</p>
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
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer transition-all mb-1"
                style={{
                  background: isActive ? config.bgColor : 'transparent',
                  border: isActive ? `1px solid ${config.borderColor}` : '1px solid transparent',
                  color: isActive ? config.color : '#4b5563',
                  fontWeight: isActive ? '600' : '500',
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
                <span className="flex-1">{config.label}</span>
                {isActive && <span className="text-xs">✓</span>}
              </button>
            );
          })}

          {/* Warning */}
          <div className="mt-2 p-2 bg-amber-500/10 rounded-md text-[10px] text-amber-900 leading-snug">
            ⚠️ Simule les permissions localement. Rechargement auto.
          </div>
        </div>
      )}
    </div>
  );
}
