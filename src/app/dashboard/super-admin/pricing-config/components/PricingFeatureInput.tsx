/**
 * PricingFeatureInput Component
 * Single feature input row for pricing plans
 * IMPORTANT: ZERO any types
 */

'use client';

import { X, GripVertical, Star } from 'lucide-react';

interface PricingFeature {
  text: string;
  isIncluded: boolean;
  isEmphasized: boolean;
  displayOrder: number;
}

interface PricingFeatureInputProps {
  feature: PricingFeature;
  index: number;
  onChange: (index: number, field: keyof PricingFeature, value: string | boolean | number) => void;
  onRemove: (index: number) => void;
}

export function PricingFeatureInput({
  feature,
  index,
  onChange,
  onRemove,
}: PricingFeatureInputProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '12px',
        background: 'rgba(147, 51, 234, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(147, 51, 234, 0.1)',
      }}
    >
      <div
        style={{
          cursor: 'grab',
          color: '#9333ea',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <GripVertical size={16} />
      </div>

      <input
        type="text"
        value={feature.text}
        onChange={(e) => onChange(index, 'text', e.target.value)}
        placeholder="Feature description"
        style={{
          flex: 1,
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(147, 51, 234, 0.2)',
          background: 'white',
          fontSize: '14px',
          outline: 'none',
        }}
      />

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          fontSize: '13px',
          color: '#6b7280',
          whiteSpace: 'nowrap',
        }}
      >
        <input
          type="checkbox"
          checked={feature.isIncluded}
          onChange={(e) => onChange(index, 'isIncluded', e.target.checked)}
          style={{
            width: '16px',
            height: '16px',
            cursor: 'pointer',
            accentColor: '#9333ea',
          }}
        />
        Included
      </label>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          fontSize: '13px',
          color: '#6b7280',
        }}
        title="Emphasize this feature"
      >
        <Star
          size={16}
          color={feature.isEmphasized ? '#f59e0b' : '#9ca3af'}
          fill={feature.isEmphasized ? '#f59e0b' : 'none'}
        />
        <input
          type="checkbox"
          checked={feature.isEmphasized}
          onChange={(e) => onChange(index, 'isEmphasized', e.target.checked)}
          style={{
            width: '16px',
            height: '16px',
            cursor: 'pointer',
            accentColor: '#f59e0b',
          }}
        />
      </label>

      <button
        type="button"
        onClick={() => onRemove(index)}
        style={{
          padding: '6px',
          borderRadius: '6px',
          border: 'none',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
