/**
 * PricingConfigHeader Component
 * Header for pricing configuration page
 * IMPORTANT: ZERO any types
 */

'use client';

import { DollarSign, Plus } from 'lucide-react';

interface PricingConfigHeaderProps {
  onCreateNew: () => void;
}

export function PricingConfigHeader({ onCreateNew }: PricingConfigHeaderProps) {
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
            background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
          }}
        >
          <DollarSign size={24} color="white" />
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(20px, 4vw, 28px)',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Pricing Plans Configuration
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Manage pricing plans, features, and display order
          </p>
        </div>
      </div>

      <button
        onClick={onCreateNew}
        style={{
          padding: '12px 24px',
          borderRadius: '12px',
          border: 'none',
          background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
          color: 'white',
          fontWeight: '600',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s',
          boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.3)';
        }}
      >
        <Plus size={18} />
        Create New Plan
      </button>
    </div>
  );
}
