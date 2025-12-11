/**
 * RoleBadge Component
 * Affiche le rôle de l'utilisateur connecté
 * IMPORTANT: ZERO any types
 */

'use client';

import { Crown, Shield, User } from 'lucide-react';
import { api } from '@/lib/trpc/client';

export function RoleBadge() {
  const { data: user } = api.auth.getMe.useQuery();

  if (!user) {
    return null;
  }

  const roleConfig = {
    SUPER_ADMIN: {
      icon: Crown,
      label: 'Super Admin',
      className: 'bg-amber-500/20 text-amber-700 border border-amber-500/30',
    },
    ADMIN: {
      icon: Shield,
      label: 'Admin',
      className: 'bg-purple-500/20 text-purple-700 border border-purple-500/30',
    },
    USER: {
      icon: User,
      label: 'Utilisateur',
      className: 'bg-gray-500/20 text-gray-700 border border-gray-500/30',
    },
  };

  const config = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.USER;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.className}`}
    >
      <Icon className="w-4 h-4" />
      <span>{config.label}</span>
    </div>
  );
}
