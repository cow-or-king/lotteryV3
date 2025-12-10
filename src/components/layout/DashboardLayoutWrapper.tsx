/**
 * Dashboard Layout Wrapper
 * Wrapper simple pour le layout du dashboard
 * IMPORTANT: ZERO any types
 */

'use client';

import { ReactNode } from 'react';

interface DashboardLayoutWrapperProps {
  children: ReactNode;
}

export function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  return <>{children}</>;
}
