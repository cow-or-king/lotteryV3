/**
 * Dashboard Page
 * Page principale du tableau de bord utilisateur
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { api } from '@/lib/trpc/client';
import { StatCard } from '@/components/dashboard/StatCard';
import { AIServiceBadge } from '@/components/ui/AIServiceBadge';
import { Store, Target, Users, TrendingUp } from 'lucide-react';

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <AIServiceBadge />
          </div>
          <p className="text-gray-600">Vue d'ensemble de votre activité</p>
        </div>
      </div>

      {/* Stats Grid */}
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
          value={stats?.stores.total ?? 0}
          icon={<Store className="w-6 h-6" />}
          description={`${stats?.stores.active ?? 0} actifs`}
          isLoading={statsLoading}
        />
        <StatCard
          title="Campagnes"
          value={stats?.campaigns.total ?? 0}
          icon={<Target className="w-6 h-6" />}
          description={`${stats?.campaigns.active ?? 0} actives`}
          isLoading={statsLoading}
        />
        <StatCard
          title="Participants"
          value={stats?.participants.total ?? 0}
          icon={<Users className="w-6 h-6" />}
          description="Total des participations"
          isLoading={statsLoading}
        />
        <StatCard
          title="Taux de conversion"
          value={
            stats && stats.participants.total > 0
              ? `${Math.round((stats.campaigns.active / stats.participants.total) * 100)}%`
              : '0%'
          }
          icon={<TrendingUp className="w-6 h-6" />}
          description="Campagnes / Participants"
          isLoading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(147, 51, 234, 0.2)',
          borderRadius: '20px',
          padding: 'clamp(24px, 4vw, 40px)',
          marginBottom: '30px',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(18px, 3vw, 24px)',
            marginBottom: '24px',
            fontWeight: '600',
            color: '#1f2937',
          }}
        >
          Actions rapides
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
            gap: '16px',
          }}
        >
          {[
            {
              label: '➕ Créer un commerce',
              color: '#667eea',
              href: '/dashboard/stores?create=true',
            },
            { label: '🎯 Nouvelle campagne', color: '#764ba2', href: '#' },
            { label: '📊 Voir statistiques', color: '#48bb78', href: '#' },
          ].map((action, index) => (
            <Link
              key={index}
              href={action.href}
              prefetch={action.href !== '#'}
              style={{
                padding: 'clamp(16px, 3vw, 20px)',
                background: `${action.color}20`,
                border: `1px solid ${action.color}30`,
                borderRadius: '12px',
                color: action.color,
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: 'clamp(13px, 2.5vw, 15px)',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                textDecoration: 'none',
                display: 'block',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${action.color}35`;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 16px ${action.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${action.color}20`;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
