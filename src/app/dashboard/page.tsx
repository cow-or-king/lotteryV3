/**
 * Dashboard Page
 * Page principale du tableau de bord utilisateur
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassBadge } from '@/components/ui/GlassBadge';

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading } = api.auth.getMe.useQuery();
  const logoutMutation = api.auth.logout.useMutation({
    onSuccess: () => {
      router.push('/login');
    },
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <AnimatedBackground />
        <GlassCard className="p-8">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        </GlassCard>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">ReviewLottery</h1>
            <GlassBadge>Dashboard</GlassBadge>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white/70">{user.email}</span>
            <GlassButton variant="secondary" size="sm" onClick={handleLogout}>
              Déconnexion
            </GlassButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Welcome Card */}
          <GlassCard className="md:col-span-2 lg:col-span-4">
            <div className="p-6">
              <h2 className="mb-2 text-3xl font-bold text-white">
                Bienvenue{user.name ? `, ${user.name}` : ''}!
              </h2>
              <p className="text-white/70">
                {user.emailVerified ? (
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Email vérifié
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    Email non vérifié - Vérifiez votre boîte mail
                  </span>
                )}
              </p>
            </div>
          </GlassCard>

          {/* Stats Cards */}
          <GlassCard>
            <div className="p-6">
              <div className="mb-2 text-sm font-medium text-white/70">Magasins</div>
              <div className="text-3xl font-bold text-white">0</div>
              <div className="mt-1 text-xs text-white/50">Aucun magasin créé</div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-6">
              <div className="mb-2 text-sm font-medium text-white/70">Campagnes actives</div>
              <div className="text-3xl font-bold text-white">0</div>
              <div className="mt-1 text-xs text-white/50">Aucune campagne</div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-6">
              <div className="mb-2 text-sm font-medium text-white/70">Participants</div>
              <div className="text-3xl font-bold text-white">0</div>
              <div className="mt-1 text-xs text-white/50">Ce mois-ci</div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-6">
              <div className="mb-2 text-sm font-medium text-white/70">Avis collectés</div>
              <div className="text-3xl font-bold text-white">0</div>
              <div className="mt-1 text-xs text-white/50">Total</div>
            </div>
          </GlassCard>
        </div>

        {/* Actions */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <GlassCard className="group cursor-pointer transition-transform hover:scale-[1.02]">
            <div className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Créer un magasin</h3>
              <p className="text-sm text-white/70">Ajoutez votre premier magasin pour commencer</p>
            </div>
          </GlassCard>

          <GlassCard className="group cursor-pointer transition-transform hover:scale-[1.02]">
            <div className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Voir les statistiques</h3>
              <p className="text-sm text-white/70">Analysez vos performances en détail</p>
            </div>
          </GlassCard>

          <GlassCard className="group cursor-pointer transition-transform hover:scale-[1.02]">
            <div className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Paramètres</h3>
              <p className="text-sm text-white/70">Configurez votre compte et vos préférences</p>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
