/**
 * AnimatedBackground Component
 * Blobs animés pour le fond du dashboard
 */

'use client';

export function AnimatedBackground() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '-20%',
          width: '400px',
          height: '400px',
          background: '#d8b4fe',
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.3,
          animation: 'blob 7s infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '0',
          right: '-20%',
          width: '400px',
          height: '400px',
          background: '#fbcfe8',
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.3,
          animation: 'blob 7s infinite 2s',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '20%',
          width: '400px',
          height: '400px',
          background: '#bfdbfe',
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.3,
          animation: 'blob 7s infinite 4s',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          right: '20%',
          width: '400px',
          height: '400px',
          background: '#fef08a',
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.3,
          animation: 'blob 7s infinite 6s',
        }}
      />
    </div>
  );
}
