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

function calculateConversionRate(stats?: Stats): string {
  const hasParticipants = stats?.participants?.total && stats.participants.total > 0;
  if (!hasParticipants || !stats?.participants) {
    return '0%';
  }
  const rate = Math.round(((stats.campaigns?.active ?? 0) / stats.participants.total) * 100);
  return `${rate}%`;
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
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
        value={stats?.stores?.total ?? 0}
        icon={<Store className="w-6 h-6" />}
        description={`${stats?.stores?.active ?? 0} actifs`}
        isLoading={isLoading}
      />
      <StatCard
        title="Campagnes"
        value={stats?.campaigns?.total ?? 0}
        icon={<Target className="w-6 h-6" />}
        description={`${stats?.campaigns?.active ?? 0} actives`}
        isLoading={isLoading}
      />
      <StatCard
        title="Participants"
        value={stats?.participants?.total ?? 0}
        icon={<Users className="w-6 h-6" />}
        description="Total des participations"
        isLoading={isLoading}
      />
      <StatCard
        title="Taux de conversion"
        value={calculateConversionRate(stats)}
        icon={<TrendingUp className="w-6 h-6" />}
        description="Campagnes / Participants"
        isLoading={isLoading}
      />
    </div>
  );
}
