import { AlertCircle } from 'lucide-react';

export function AIConfigSecurityNote() {
  return (
    <div
      style={{
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
          Sécurité
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
          Les clés API sont sensibles et doivent être protégées. Elles seront chiffrées avant
          d&apos;être stockées dans la base de données. Ne partagez jamais vos clés API.
        </p>
      </div>
    </div>
  );
}
