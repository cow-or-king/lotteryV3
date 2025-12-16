/**
 * Composant Actions rapides du dashboard
 */

import Link from 'next/link';

interface QuickAction {
  label: string;
  color: string;
  href: string;
}

const actions: QuickAction[] = [
  {
    label: '➕ Créer un commerce',
    color: '#667eea',
    href: '/dashboard/stores?create=true',
  },
  { label: '🎯 Nouvelle campagne', color: '#764ba2', href: '#' },
  { label: '📊 Voir statistiques', color: '#48bb78', href: '#' },
];

export function QuickActions() {
  return (
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
        {actions.map((action, index) => (
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
  );
}
