/**
 * Dashboard Super-Admin
 * Vue d'ensemble plateforme + gestion clients
 * IMPORTANT: ZERO any types, Protected SUPER_ADMIN only
 */

'use client';

import { api } from '@/lib/trpc/client';
import { AIServiceBadge } from '@/components/ui/AIServiceBadge';
import Link from 'next/link';
import {
  Users,
  Store,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Settings,
  BarChart3,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { data: stats, isLoading } = api.admin.getPlatformStats.useQuery(undefined, {
    refetchInterval: 30000, // Refetch toutes les 30 secondes
  });

  const { data: clientsData } = api.admin.listClients.useQuery({
    limit: 10,
    offset: 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Super-Admin</h1>
            <AIServiceBadge showProvider />
          </div>
          <p className="text-gray-600">Vue d'ensemble de la plateforme ReviewLottery</p>
        </div>
        <Link
          href="/admin/ai-config"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
        >
          <Settings className="w-5 h-5" />
          Config IA
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users */}
        <div className="p-6 bg-white/60 backdrop-blur-lg rounded-2xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-blue-600 font-semibold bg-blue-100 px-2 py-1 rounded-full">
              {stats?.users.active || 0} actifs
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats?.users.total || 0}</h3>
          <p className="text-sm text-gray-600">Utilisateurs</p>
        </div>

        {/* Stores */}
        <div className="p-6 bg-white/60 backdrop-blur-lg rounded-2xl border border-green-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Store className="w-8 h-8 text-green-600" />
            <span className="text-sm text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">
              {stats?.stores.apiConfigurationRate.toFixed(0)}% API
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats?.stores.total || 0}</h3>
          <p className="text-sm text-gray-600">Commerces</p>
        </div>

        {/* Reviews */}
        <div className="p-6 bg-white/60 backdrop-blur-lg rounded-2xl border border-yellow-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <MessageSquare className="w-8 h-8 text-yellow-600" />
            <span className="text-sm text-yellow-600 font-semibold bg-yellow-100 px-2 py-1 rounded-full">
              {stats?.reviews.responseRate.toFixed(0)}% réponses
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats?.reviews.total || 0}</h3>
          <p className="text-sm text-gray-600">Avis Google</p>
        </div>

        {/* IA Usage */}
        <div className="p-6 bg-white/60 backdrop-blur-lg rounded-2xl border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <span className="text-sm text-purple-600 font-semibold bg-purple-100 px-2 py-1 rounded-full">
              ${stats?.ai.totalCostUsd.toFixed(2)}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats?.ai.totalRequests || 0}</h3>
          <p className="text-sm text-gray-600">Requêtes IA</p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Health */}
        <div className="p-6 bg-white/60 backdrop-blur-lg rounded-2xl border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Santé Plateforme</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Taux de configuration API</span>
              <span className="font-semibold text-gray-900">
                {stats?.stores.apiConfigurationRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Taux de réponse avis</span>
              <span className="font-semibold text-gray-900">
                {stats?.reviews.responseRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Note moyenne avis</span>
              <span className="font-semibold text-gray-900">
                {stats?.reviews.averageRating.toFixed(1)} / 5
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Provider IA actif</span>
              <span className="font-semibold text-gray-900">
                {stats?.ai.activeProvider || 'Aucun'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Clients */}
        <div className="p-6 bg-white/60 backdrop-blur-lg rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">Derniers Clients</h2>
            </div>
            <Link
              href="/admin/clients"
              className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
            >
              Voir tous →
            </Link>
          </div>
          <div className="space-y-3">
            {clientsData?.clients.slice(0, 5).map((client) => (
              <div
                key={client.id}
                className="flex justify-between items-center pb-3 border-b last:border-0"
              >
                <div>
                  <p className="font-semibold text-gray-900">{client.fullName}</p>
                  <p className="text-xs text-gray-500">{client.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {client.storesCount} commerces
                  </p>
                  <p className="text-xs text-gray-500">{client.reviewsCount} avis</p>
                </div>
              </div>
            ))}
            {(!clientsData?.clients || clientsData.clients.length === 0) && (
              <p className="text-center text-gray-500 py-4">Aucun client pour le moment</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
