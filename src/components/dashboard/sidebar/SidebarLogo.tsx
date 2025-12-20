/**
 * SidebarLogo Component
 * Logo du sidebar avec support mode compact
 * IMPORTANT: ZERO any types
 */

import Image from 'next/image';

interface SidebarLogoProps {
  isCompactMode: boolean;
}

export function SidebarLogo({ isCompactMode }: SidebarLogoProps) {
  return (
    <div
      style={{
        padding: isCompactMode ? '10px 0' : '30px 24px',
        textAlign: isCompactMode ? 'center' : 'left',
      }}
    >
      {isCompactMode ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Image src="/badge.png" alt="C&B" width={40} height={40} />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Image src="/badge.png" alt="Connect & Boost" width={48} height={48} />
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                background:
                  'linear-gradient(135deg, #FFB800 0%, #FF006E 50%, #8B5CF6 75%, #00D9FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0,
              }}
            >
              Connect & Boost
            </h1>
          </div>
          <p
            style={{
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '8px',
              marginLeft: '60px',
              margin: 0,
            }}
          >
            Admin Panel
          </p>
        </>
      )}
    </div>
  );
}
