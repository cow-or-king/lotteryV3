/**
 * QR Code Statistics Page
 * Page d'administration des statistiques d'un QR code
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { ArrowLeft, TrendingUp, Calendar, Clock, Scan } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function QRCodeStatsPage() {
  const params = useParams();
  const router = useRouter();
  const qrCodeId = params.id as string;
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Fetch QR code details
  const { data: qrCode, isLoading: qrCodeLoading } = api.qrCode.getById.useQuery({
    id: qrCodeId,
  });

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = api.qrCode.getStats.useQuery({
    id: qrCodeId,
    period,
    date: selectedDay || undefined,
  });

  // Auto-select the most recent day when stats are loaded
  useEffect(() => {
    if (stats && stats.scansByDay.length > 0 && !selectedDay) {
      const sortedDays = [...stats.scansByDay].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      if (sortedDays[0]) {
        setSelectedDay(sortedDays[0].date);
      }
    }
  }, [stats, selectedDay]);

  const isLoading = qrCodeLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!qrCode || !stats) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">QR code non trouvé</p>
      </div>
    );
  }

  const formatDate = (date: Date | null) => {
    if (!date) {
      return 'Jamais';
    }
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/qr-codes')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux QR codes
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Statistiques - {qrCode.name}</h1>
            <p className="text-gray-600">{qrCode.url}</p>
          </div>

          {/* Period selector */}
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  period === p
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white/50 text-gray-700 hover:bg-white/70'
                }`}
              >
                {p === '7d' && '7 jours'}
                {p === '30d' && '30 jours'}
                {p === '90d' && '90 jours'}
                {p === 'all' && 'Tout'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Scans */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Scan className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total des scans</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalScans}</p>
        </div>

        {/* Scans Today */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Aujourd&apos;hui</p>
          <p className="text-3xl font-bold text-gray-900">{stats.scansToday}</p>
        </div>

        {/* Scans This Week */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Cette semaine (7j)</p>
          <p className="text-3xl font-bold text-gray-900">{stats.scansThisWeek}</p>
        </div>

        {/* Scans This Month */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Ce mois (30j)</p>
          <p className="text-3xl font-bold text-gray-900">{stats.scansThisMonth}</p>
        </div>
      </div>

      {/* Last Scan Info */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Dernier scan</h2>
        <p className="text-gray-700">{formatDate(stats.lastScan)}</p>
      </div>

      {/* Scans by Hour - Vertical Graph */}
      {selectedDay && stats.scansByHour && stats.scansByHour.length > 0 && (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Distribution horaire</h2>
          <p className="text-sm text-gray-600 mb-6">
            {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' }).format(new Date(selectedDay))}
          </p>
          <div className="flex gap-1 h-80">
            {Array.from({ length: 24 }, (_, i) => {
              const hourData = stats.scansByHour.find(
                (h: { hour: number; count: number }) => h.hour === i,
              );
              const count = hourData?.count || 0;
              const maxCount = Math.max(
                ...stats.scansByHour.map((h: { hour: number; count: number }) => h.count),
                1,
              );
              const percentage = (count / maxCount) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2">
                  {count > 0 && <span className="text-xs font-bold text-purple-600">{count}</span>}
                  <div className="w-full bg-gray-100 rounded-t-lg flex-1 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all duration-300"
                      style={{ height: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-700 transform -rotate-45 origin-top-left mt-1">
                    {i}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scans Timeline */}
      {stats.scansByDay.length > 0 && (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Scans par jour ({period})</h2>
          <p className="text-sm text-gray-600 mb-6">
            Cliquez sur un jour pour voir la distribution horaire
          </p>
          <div className="space-y-3">
            {stats.scansByDay
              .sort(
                (a: { date: string; count: number }, b: { date: string; count: number }) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .map((day: { date: string; count: number }) => (
                <button
                  key={day.date}
                  onClick={() => setSelectedDay(day.date)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    selectedDay === day.date
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500'
                      : 'bg-white/40 hover:bg-white/60 border-2 border-transparent'
                  }`}
                >
                  <span
                    className={`font-medium ${selectedDay === day.date ? 'text-purple-700' : 'text-gray-800'}`}
                  >
                    {new Intl.DateTimeFormat('fr-FR', {
                      dateStyle: 'full',
                    }).format(new Date(day.date))}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{
                          width: `${Math.min((day.count / Math.max(...stats.scansByDay.map((d: { date: string; count: number }) => d.count))) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <span
                      className={`font-bold w-12 text-right ${selectedDay === day.date ? 'text-purple-700' : 'text-purple-600'}`}
                    >
                      {day.count}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.scansByDay.length === 0 && (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 p-12 text-center shadow-lg">
          <Scan className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun scan</h3>
          <p className="text-gray-600">
            Ce QR code n&apos;a pas encore été scanné sur la période sélectionnée.
          </p>
        </div>
      )}
    </div>
  );
}
