/**
 * Composant Stats pour la page Winners
 */

interface WinnersStats {
  total: number;
  pending: number;
  claimed: number;
  expired: number;
}

interface WinnersStatsProps {
  stats: WinnersStats;
  isLoading: boolean;
}

export function WinnersStatsCards({ stats, isLoading }: WinnersStatsProps) {
  const statCards = [
    {
      label: 'Total',
      value: stats.total,
      colorClass: 'border-gray-200/50',
      textColor: 'text-gray-900',
    },
    {
      label: 'En attente',
      value: stats.pending,
      colorClass: 'border-amber-200/50',
      textColor: 'text-amber-600',
      labelColor: 'text-amber-700',
    },
    {
      label: 'Réclamés',
      value: stats.claimed,
      colorClass: 'border-emerald-200/50',
      textColor: 'text-emerald-600',
      labelColor: 'text-emerald-700',
    },
    {
      label: 'Expirés',
      value: stats.expired,
      colorClass: 'border-red-200/50',
      textColor: 'text-red-600',
      labelColor: 'text-red-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={`bg-white/80 backdrop-blur-sm border ${stat.colorClass} rounded-xl p-6 shadow-sm`}
        >
          <p className={`text-sm ${stat.labelColor || 'text-gray-600'} mb-2`}>{stat.label}</p>
          <p className={`text-3xl font-bold ${stat.textColor}`}>{isLoading ? '...' : stat.value}</p>
        </div>
      ))}
    </div>
  );
}
