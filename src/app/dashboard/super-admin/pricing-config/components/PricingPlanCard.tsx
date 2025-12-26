/**
 * PricingPlanCard Component
 * Display single pricing plan card
 * IMPORTANT: ZERO any types
 */

'use client';

import { Edit, Trash2, Power, ChevronUp, ChevronDown, Check, X } from 'lucide-react';

interface PricingFeature {
  id: string;
  text: string;
  isIncluded: boolean;
  isEmphasized: boolean;
  displayOrder: number;
}

interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  currency: string;
  isActive: boolean;
  isPopular: boolean;
  displayOrder: number;
  ctaText: string;
  ctaHref: string;
  badgeText: string | null;
  features: PricingFeature[];
}

interface PricingPlanCardProps {
  plan: PricingPlan;
  onEdit: (plan: PricingPlan) => void;
  onDelete: (plan: PricingPlan) => void;
  onToggleActive: (plan: PricingPlan) => void;
  onMoveUp?: (plan: PricingPlan) => void;
  onMoveDown?: (plan: PricingPlan) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export function PricingPlanCard({
  plan,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: PricingPlanCardProps) {
  const formatPrice = (price: number | null): string => {
    if (price === null) {
      return 'N/A';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: plan.currency,
    }).format(price);
  };

  return (
    <div
      style={{
        background: plan.isActive ? 'rgba(255, 255, 255, 0.6)' : 'rgba(156, 163, 175, 0.2)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: plan.isPopular
          ? '2px solid rgba(236, 72, 153, 0.4)'
          : '1px solid rgba(147, 51, 234, 0.2)',
        padding: '24px',
        boxShadow: plan.isPopular
          ? '0 8px 24px rgba(236, 72, 153, 0.2)'
          : '0 4px 12px rgba(147, 51, 234, 0.1)',
        transition: 'all 0.3s',
        opacity: plan.isActive ? 1 : 0.7,
        position: 'relative',
      }}
    >
      {/* Badge */}
      {plan.badgeText && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
            color: 'white',
            padding: '4px 16px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
          }}
        >
          {plan.badgeText}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: '8px',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {plan.name}
            </h3>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '12px',
                color: '#6b7280',
                fontFamily: 'monospace',
              }}
            >
              /{plan.slug}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {/* Move Up/Down */}
            {onMoveUp && (
              <button
                onClick={() => onMoveUp(plan)}
                disabled={!canMoveUp}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: canMoveUp ? 'rgba(147, 51, 234, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                  color: canMoveUp ? '#9333ea' : '#9ca3af',
                  cursor: canMoveUp ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <ChevronUp size={14} />
              </button>
            )}
            {onMoveDown && (
              <button
                onClick={() => onMoveDown(plan)}
                disabled={!canMoveDown}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: canMoveDown ? 'rgba(147, 51, 234, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                  color: canMoveDown ? '#9333ea' : '#9ca3af',
                  cursor: canMoveDown ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <ChevronDown size={14} />
              </button>
            )}
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
          {plan.description}
        </p>
      </div>

      {/* Pricing */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '16px',
          padding: '12px',
          background: 'rgba(147, 51, 234, 0.05)',
          borderRadius: '12px',
        }}
      >
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: '11px',
              color: '#6b7280',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            Monthly
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: '#374151' }}>
            {formatPrice(plan.monthlyPrice)}
          </p>
        </div>
        <div
          style={{
            width: '1px',
            background: 'rgba(147, 51, 234, 0.2)',
          }}
        />
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: '11px',
              color: '#6b7280',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            Annual
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: '#374151' }}>
            {formatPrice(plan.annualPrice)}
          </p>
        </div>
      </div>

      {/* Features */}
      {plan.features.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
            Features ({plan.features.length})
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '120px',
              overflowY: 'auto',
            }}
          >
            {plan.features.slice(0, 5).map((feature) => (
              <div
                key={feature.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: feature.isIncluded ? '#374151' : '#9ca3af',
                  fontWeight: feature.isEmphasized ? '600' : '400',
                }}
              >
                {feature.isIncluded ? (
                  <Check size={14} color="#10b981" />
                ) : (
                  <X size={14} color="#ef4444" />
                )}
                <span>{feature.text}</span>
              </div>
            ))}
            {plan.features.length > 5 && (
              <p
                style={{
                  margin: '4px 0 0 22px',
                  fontSize: '12px',
                  color: '#9ca3af',
                  fontStyle: 'italic',
                }}
              >
                +{plan.features.length - 5} more...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Status Badges */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600',
            background: plan.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: plan.isActive ? '#059669' : '#dc2626',
          }}
        >
          {plan.isActive ? 'Active' : 'Inactive'}
        </span>
        {plan.isPopular && (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '600',
              background: 'rgba(236, 72, 153, 0.1)',
              color: '#ec4899',
            }}
          >
            Popular
          </span>
        )}
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600',
            background: 'rgba(147, 51, 234, 0.1)',
            color: '#9333ea',
          }}
        >
          Order: {plan.displayOrder}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onToggleActive(plan)}
          style={{
            flex: 1,
            minWidth: '100px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: plan.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            color: plan.isActive ? '#dc2626' : '#059669',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = plan.isActive
              ? 'rgba(239, 68, 68, 0.2)'
              : 'rgba(34, 197, 94, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = plan.isActive
              ? 'rgba(239, 68, 68, 0.1)'
              : 'rgba(34, 197, 94, 0.1)';
          }}
        >
          <Power size={14} />
          {plan.isActive ? 'Deactivate' : 'Activate'}
        </button>

        <button
          onClick={() => onEdit(plan)}
          style={{
            flex: 1,
            minWidth: '100px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
            color: 'white',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.3s',
            boxShadow: '0 2px 8px rgba(147, 51, 234, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Edit size={14} />
          Edit
        </button>

        <button
          onClick={() => onDelete(plan)}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
