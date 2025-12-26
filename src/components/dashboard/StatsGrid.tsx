/**
 * Composant Grid des statistiques du dashboard
 */

import { StatCard } from '@/components/dashboard/StatCard';
import { Store, Target, Users, TrendingUp } from 'lucide-react';

interface Stats {
  stores?: {
    total: number;
    active: number;
  };
  campaigns?: {
    total: number;
    active: number;
  };
  participants?: {
    total: number;
  };
}

interface StatsGridProps {
  stats?: Stats;
  isLoading: boolean;
}

// Helper functions extracted outside component
function getStoresTotal(stats?: Stats): number {
  return stats?.stores?.total ?? 0;
}

function getStoresActive(stats?: Stats): number {
  return stats?.stores?.active ?? 0;
}

function getCampaignsTotal(stats?: Stats): number {
  return stats?.campaigns?.total ?? 0;
}

function getCampaignsActive(stats?: Stats): number {
  return stats?.campaigns?.active ?? 0;
}

function getParticipantsTotal(stats?: Stats): number {
  return stats?.participants?.total ?? 0;
}

function calculateConversionRate(stats?: Stats): string {
  const participantsTotal = getParticipantsTotal(stats);
  const hasParticipants = participantsTotal > 0;

  if (!hasParticipants) {
    return '0%';
  }

  const campaignsActive = getCampaignsActive(stats);
  const rate = Math.round((campaignsActive / participantsTotal) * 100);
  return `${rate}%`;
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  // Pre-compute all values
  const storesTotal = getStoresTotal(stats);
  const storesActive = getStoresActive(stats);
  const campaignsTotal = getCampaignsTotal(stats);
  const campaignsActive = getCampaignsActive(stats);
  const participantsTotal = getParticipantsTotal(stats);
  const conversionRate = calculateConversionRate(stats);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
        gap: '20px',
        marginBottom: '30px',
      }}
    >
      <StatCard
        title="Commerces"
        value={storesTotal}
        icon={<Store className="w-6 h-6" />}
        description={`${storesActive} actifs`}
        isLoading={isLoading}
      />
      <StatCard
        title="Campagnes"
        value={campaignsTotal}
        icon={<Target className="w-6 h-6" />}
        description={`${campaignsActive} actives`}
        isLoading={isLoading}
      />
      <StatCard
        title="Participants"
        value={participantsTotal}
        icon={<Users className="w-6 h-6" />}
        description="Total des participations"
        isLoading={isLoading}
      />
      <StatCard
        title="Taux de conversion"
        value={conversionRate}
        icon={<TrendingUp className="w-6 h-6" />}
        description="Campagnes / Participants"
        isLoading={isLoading}
      />
    </div>
  );
}
