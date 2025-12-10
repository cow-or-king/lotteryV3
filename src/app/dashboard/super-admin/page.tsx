/**
 * Dashboard Super-Admin
 * Page principale avec vue d'ensemble et gestion de la plateforme
 * IMPORTANT: ZERO any types
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePermissions } from '@/lib/rbac/usePermissions';
import { api } from '@/lib/trpc/client';
import { Users, Store, Star, TrendingUp, Crown, Settings } from 'lucide-react';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { isSuperAdmin } = usePermissions();
  const { data: user } = api.auth.getMe.useQuery();

  // Rediriger si pas SUPER_ADMIN
  useEffect(() => {
    if (user && !isSuperAdmin()) {
      router.push('/dashboard');
    }
  }, [user, isSuperAdmin, router]);

  if (!user || !isSuperAdmin()) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header avec badge Super-Admin */}
      <div
        style={{
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
            }}
          >
            <Crown size={24} color="white" />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(20px, 4vw, 28px)',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #dc2626 0%, #9333ea 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Dashboard Super-Admin
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              Vue d'ensemble de la plateforme
            </p>
          </div>
        </div>
      </div>

      {/* Stats principales */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        <StatCard
          icon={<Users size={24} />}
          label="Utilisateurs"
          value="12"
          color="#3b82f6"
          bgColor="rgba(59, 130, 246, 0.1)"
        />
        <StatCard
          icon={<Store size={24} />}
          label="Commerces"
          value="8"
          color="#8b5cf6"
          bgColor="rgba(139, 92, 246, 0.1)"
        />
        <StatCard
          icon={<Star size={24} />}
          label="Avis Traités"
          value="156"
          color="#f59e0b"
          bgColor="rgba(245, 158, 11, 0.1)"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label="IA Utilisations"
          value="42"
          color="#10b981"
          bgColor="rgba(16, 185, 129, 0.1)"
        />
      </div>

      {/* Actions rapides */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(147, 51, 234, 0.2)',
          padding: '24px',
        }}
      >
        <h2
          style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
          }}
        >
          Actions Rapides
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <ActionCard
            icon={<Settings size={20} />}
            label="Gérer les Menus"
            description="Configurer la visibilité des menus"
            onClick={() => router.push('/dashboard/super-admin/menu-config')}
          />
          <ActionCard
            icon={<Settings size={20} />}
            label="Config IA"
            description="Gérer les services d'IA"
            onClick={() => router.push('/dashboard/super-admin/ai-config')}
          />
          <ActionCard
            icon={<Users size={20} />}
            label="Gestion Clients"
            description="Voir tous les clients"
            onClick={() => router.push('/dashboard/super-admin/clients')}
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '12px',
        border: '1px solid rgba(147, 51, 234, 0.2)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{value}</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{label}</p>
      </div>
    </div>
  );
}

interface ActionCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}

function ActionCard({ icon, label, description, onClick }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'rgba(255, 255, 255, 0.4)',
        border: '1px solid rgba(147, 51, 234, 0.2)',
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(147, 51, 234, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
        e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.2)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'rgba(147, 51, 234, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9333ea',
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{description}</p>
      </div>
    </button>
  );
}
