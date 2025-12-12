import { Cpu, RotateCcw } from 'lucide-react';

interface AIConfigHeaderProps {
  hasChanges: boolean;
  onReset: () => void;
}

export function AIConfigHeader({ hasChanges, onReset }: AIConfigHeaderProps) {
  return (
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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          }}
        >
          <Cpu size={24} color="white" />
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(20px, 4vw, 28px)',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Configuration IA
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Gérer les services d&apos;intelligence artificielle
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onReset}
          disabled={!hasChanges}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            color: '#10b981',
            fontWeight: '500',
            fontSize: '14px',
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            opacity: hasChanges ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <RotateCcw size={16} />
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
