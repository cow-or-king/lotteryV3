/**
 * Role Impersonator Component
 * Permet aux SUPER_ADMIN de tester l'interface avec différents rôles
 * IMPORTANT: ZERO any types
 */

'use client';

import { UserRole } from '@/lib/rbac/permissions';
import { Crown, Eye, EyeOff, Shield, User } from 'lucide-react';
import { useState } from 'react';

interface RoleImpersonatorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function RoleImpersonator({ currentRole, onRoleChange }: RoleImpersonatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const roles: Array<{ value: UserRole; label: string; icon: typeof Crown; color: string }> = [
    { value: 'SUPER_ADMIN', label: 'Super Admin', icon: Crown, color: 'red' },
    { value: 'ADMIN', label: 'Admin', icon: Shield, color: 'purple' },
    { value: 'USER', label: 'User', icon: User, color: 'blue' },
  ];

  const currentRoleConfig = roles.find((r) => r.value === currentRole);
  const Icon = currentRoleConfig?.icon || User;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
        >
          <Eye className="w-5 h-5" />
          <span>Tester Vue</span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">Mode Test</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <EyeOff className="w-5 h-5" />
            </button>
          </div>

          {/* Current Role Badge */}
          <div className="mb-4 p-3 bg-linear-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            <p className="text-xs text-gray-600 mb-1">Vue actuelle</p>
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-900">{currentRoleConfig?.label}</span>
            </div>
          </div>

          {/* Role Selector */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-3">Changer de vue :</p>
            {roles.map((role) => {
              const RoleIcon = role.icon;
              const isActive = currentRole === role.value;

              return (
                <button
                  key={role.value}
                  onClick={() => onRoleChange(role.value)}
                  disabled={isActive}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-linear-to-r from-purple-100 to-blue-100 border-2 border-purple-300 cursor-not-allowed'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      role.color === 'red'
                        ? 'bg-red-100'
                        : role.color === 'purple'
                          ? 'bg-purple-100'
                          : 'bg-blue-100'
                    }`}
                  >
                    <RoleIcon
                      className={`w-5 h-5 ${
                        role.color === 'red'
                          ? 'text-red-600'
                          : role.color === 'purple'
                            ? 'text-purple-600'
                            : 'text-blue-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">{role.label}</p>
                    <p className="text-xs text-gray-500">
                      {role.value === 'SUPER_ADMIN'
                        ? 'Accès complet plateforme'
                        : role.value === 'ADMIN'
                          ? 'Gestion commerces & avis'
                          : 'Vue client standard'}
                    </p>
                  </div>
                  {isActive && <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />}
                </button>
              );
            })}
          </div>

          {/* Warning */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-xs text-yellow-800">
              ⚠️ Mode test uniquement. Les permissions sont simulées localement.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
