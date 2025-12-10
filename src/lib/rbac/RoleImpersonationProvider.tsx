/**
 * Role Impersonation Context Provider
 * Permet aux SUPER_ADMIN de simuler l'expérience avec différents rôles
 * IMPORTANT: ZERO any types
 */

'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserRole } from './permissions';

interface RoleImpersonationContextType {
  impersonatedRole: UserRole | null;
  setImpersonatedRole: (role: UserRole | null) => void;
  isImpersonating: boolean;
  resetImpersonation: () => void;
}

const RoleImpersonationContext = createContext<RoleImpersonationContextType | undefined>(undefined);

interface RoleImpersonationProviderProps {
  children: ReactNode;
}

export function RoleImpersonationProvider({ children }: RoleImpersonationProviderProps) {
  const [impersonatedRole, setImpersonatedRoleState] = useState<UserRole | null>(null);

  // Charger depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem('impersonated_role');
    if (stored && (stored === 'SUPER_ADMIN' || stored === 'ADMIN' || stored === 'USER')) {
      setImpersonatedRoleState(stored as UserRole);
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  const setImpersonatedRole = (role: UserRole | null) => {
    setImpersonatedRoleState(role);
    if (role) {
      localStorage.setItem('impersonated_role', role);
    } else {
      localStorage.removeItem('impersonated_role');
    }
  };

  const resetImpersonation = () => {
    setImpersonatedRole(null);
  };

  return (
    <RoleImpersonationContext.Provider
      value={{
        impersonatedRole,
        setImpersonatedRole,
        isImpersonating: impersonatedRole !== null,
        resetImpersonation,
      }}
    >
      {children}
    </RoleImpersonationContext.Provider>
  );
}

export function useRoleImpersonation() {
  const context = useContext(RoleImpersonationContext);
  if (context === undefined) {
    throw new Error('useRoleImpersonation must be used within a RoleImpersonationProvider');
  }
  return context;
}
