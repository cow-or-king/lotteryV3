/**
 * DeleteConfirmModal Component
 * Confirmation dialog for deleting pricing plans
 * IMPORTANT: ZERO any types
 */

'use client';

import { AlertTriangle } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  slug: string;
}

interface DeleteConfirmModalProps {
  plan: PricingPlan;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  plan,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmModalProps) {
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
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(239, 68, 68, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <AlertTriangle size={32} color="#ef4444" />
        </div>

        {/* Title */}
        <h2
          style={{
            margin: '0 0 12px 0',
            fontSize: '24px',
            fontWeight: '700',
            textAlign: 'center',
            color: '#1f2937',
          }}
        >
          Delete Pricing Plan?
        </h2>

        {/* Message */}
        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '14px',
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: '1.6',
          }}
        >
          Are you sure you want to delete the pricing plan <strong>"{plan.name}"</strong> (
          {plan.slug})?
          <br />
          <br />
          This action cannot be undone. All associated features will also be permanently deleted.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            style={{
              flex: 1,
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(20px)',
              color: '#9333ea',
              fontWeight: '500',
              fontSize: '14px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              flex: 1,
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: isDeleting
                ? 'rgba(239, 68, 68, 0.5)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              fontWeight: '500',
              fontSize: '14px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
