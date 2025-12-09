/**
 * SidebarLogo Component
 * Logo du sidebar avec support mode compact
 * IMPORTANT: ZERO any types
 */

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
        <div style={{ fontSize: '32px', margin: 0 }}>🎲</div>
      ) : (
        <>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
            }}
          >
            🎲 ReviewLottery
          </h1>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', margin: 0 }}>
            v3.0 - Admin Panel
          </p>
        </>
      )}
    </div>
  );
}
