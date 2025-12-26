/**
 * PricingPlanModal Component
 * Modal wrapper for create/edit pricing plan forms
 * IMPORTANT: ZERO any types
 */

'use client';

import { X } from 'lucide-react';
import { PricingPlanForm } from './PricingPlanForm';

interface PricingFeature {
  text: string;
  isIncluded: boolean;
  isEmphasized: boolean;
  displayOrder: number;
}

interface PricingPlanFormData {
  name: string;
  slug: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  currency: string;
  isActive: boolean;
  isPopular: boolean;
  displayOrder: number;
  ctaText: string;
  ctaHref: string;
  badgeText: string;
  features: PricingFeature[];
}

interface PricingPlanModalProps {
  mode: 'create' | 'edit';
  initialData?: PricingPlanFormData;
  onSubmit: (data: PricingPlanFormData) => void;
  onClose: () => void;
}

export function PricingPlanModal({ mode, initialData, onSubmit, onClose }: PricingPlanModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(147, 51, 234, 0.2)',
          padding: '32px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(147, 51, 234, 0.3)',
          margin: '20px auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {mode === 'create' ? 'Create Pricing Plan' : 'Edit Pricing Plan'}
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(147, 51, 234, 0.1)',
              color: '#9333ea',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(147, 51, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(147, 51, 234, 0.1)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <PricingPlanForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitLabel={mode === 'create' ? 'Create Plan' : 'Update Plan'}
        />
      </div>
    </div>
  );
}
