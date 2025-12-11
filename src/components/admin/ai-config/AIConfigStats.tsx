/**
 * Composant pour afficher les statistiques d'utilisation de l'IA
 * ZERO any types
 */

'use client';

import { BarChart3, CheckCircle2, Sparkles } from 'lucide-react';
import { AIUsageStats } from '@/lib/types/ai-config.types';

interface AIConfigStatsProps {
  stats: AIUsageStats | undefined;
}

export function AIConfigStats({ stats }: AIConfigStatsProps) {
  if (!stats) {
    return null;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '30px',
      }}
    >
      {/* Requêtes totales */}
      <div
        style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          border: '1px solid rgba(147, 51, 234, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart3 size={32} color="#9333ea" />
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Requêtes totales</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              {stats.totalRequests}
            </p>
          </div>
        </div>
      </div>

      {/* Requêtes utilisées */}
      <div
        style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle2 size={32} color="#10b981" />
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Utilisées</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              {stats.usedRequests}
            </p>
          </div>
        </div>
      </div>

      {/* Tokens */}
      <div
        style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sparkles size={32} color="#3b82f6" />
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Tokens</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              {stats.totalTokens.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Coût estimé */}
      <div
        style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          border: '1px solid rgba(234, 179, 8, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>💰</span>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Coût estimé</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              ${stats.totalCostUsd.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
