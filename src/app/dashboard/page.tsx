/**
 * Dashboard Page
 * Page principale du tableau de bord utilisateur
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { useEffect } from 'react';
import { api } from '@/lib/trpc/client';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default function DashboardPage() {
  // Récupérer les stats avec tRPC
  const { data: stats, isLoading: statsLoading } = api.dashboard.getStats.useQuery();

  // Prefetch stores data pour navigation plus rapide
  const utils = api.useUtils();

  useEffect(() => {
    // Prefetch les stores quand le dashboard est chargé
    void utils.store.list.prefetch();
  }, [utils]);

  return (
    <div>
      <DashboardHeader />
      <StatsGrid stats={stats} isLoading={statsLoading} />
      <QuickActions />
    </div>
  );
}
