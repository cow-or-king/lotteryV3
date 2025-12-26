/**
 * PricingPlanForm Component
 * Form for creating/editing pricing plans
 * IMPORTANT: ZERO any types
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { PricingFeatureInput } from './PricingFeatureInput';

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

interface PricingPlanFormProps {
  initialData?: PricingPlanFormData;
  onSubmit: (data: PricingPlanFormData) => void;
  onCancel: () => void;
  submitLabel: string;
}

const defaultFormData: PricingPlanFormData = {
  name: '',
  slug: '',
  description: '',
  monthlyPrice: '',
  annualPrice: '',
  currency: 'EUR',
  isActive: true,
  isPopular: false,
  displayOrder: 0,
  ctaText: "Commencer l'essai",
  ctaHref: '/login',
  badgeText: '',
  features: [],
};

export function PricingPlanForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel,
}: PricingPlanFormProps) {
  const [formData, setFormData] = useState<PricingPlanFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from name
  useEffect(() => {
    if (!initialData && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, initialData]);

  const handleChange = (field: keyof PricingPlanFormData, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFeatureChange = (
    index: number,
    field: keyof PricingFeature,
    value: string | boolean | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    }));
  };

  const handleAddFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        {
          text: '',
          isIncluded: true,
          isEmphasized: false,
          displayOrder: prev.features.length,
        },
      ],
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features
        .filter((_, i) => i !== index)
        .map((f, i) => ({ ...f, displayOrder: i })),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!formData.slug || formData.slug.trim().length < 2) {
      newErrors.slug = 'Slug must be at least 2 characters';
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase alphanumeric with hyphens';
    }
    if (!formData.description || formData.description.trim().length < 2) {
      newErrors.description = 'Description must be at least 2 characters';
    }
    if (!formData.ctaText || formData.ctaText.trim().length === 0) {
      newErrors.ctaText = 'CTA text is required';
    }
    if (!formData.ctaHref || formData.ctaHref.trim().length === 0) {
      newErrors.ctaHref = 'CTA href is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Name */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            Plan Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Professional"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: errors.name ? '1px solid #ef4444' : '1px solid rgba(147, 51, 234, 0.2)',
              background: 'white',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          {errors.name && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444' }}>{errors.name}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            Slug *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="e.g., professional"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: errors.slug ? '1px solid #ef4444' : '1px solid rgba(147, 51, 234, 0.2)',
              background: 'white',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          {errors.slug && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444' }}>{errors.slug}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px',
          }}
        >
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe this pricing plan..."
          rows={3}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: errors.description ? '1px solid #ef4444' : '1px solid rgba(147, 51, 234, 0.2)',
            background: 'white',
            fontSize: '14px',
            outline: 'none',
            resize: 'vertical',
          }}
        />
        {errors.description && (
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444' }}>
            {errors.description}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        {/* Monthly Price */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            Monthly Price
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.monthlyPrice}
            onChange={(e) => handleChange('monthlyPrice', e.target.value)}
            placeholder="0.00"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              background: 'white',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Annual Price */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            Annual Price
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.annualPrice}
            onChange={(e) => handleChange('annualPrice', e.target.value)}
            placeholder="0.00"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              background: 'white',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Currency */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              background: 'white',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* CTA Text */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            CTA Text *
          </label>
          <input
            type="text"
            value={formData.ctaText}
            onChange={(e) => handleChange('ctaText', e.target.value)}
            placeholder="e.g., Get Started"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: errors.ctaText ? '1px solid #ef4444' : '1px solid rgba(147, 51, 234, 0.2)',
              background: 'white',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          {errors.ctaText && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444' }}>
              {errors.ctaText}
            </p>
          )}
        </div>

        {/* CTA Href */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            CTA Link *
          </label>
          <input
            type="text"
            value={formData.ctaHref}
            onChange={(e) => handleChange('ctaHref', e.target.value)}
            placeholder="e.g., /signup"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: errors.ctaHref ? '1px solid #ef4444' : '1px solid rgba(147, 51, 234, 0.2)',
              background: 'white',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          {errors.ctaHref && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444' }}>
              {errors.ctaHref}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Badge Text */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            Badge Text (optional)
          </label>
          <input
            type="text"
            value={formData.badgeText}
            onChange={(e) => handleChange('badgeText', e.target.value)}
            placeholder="e.g., Most Popular"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              background: 'white',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Display Order */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            Display Order
          </label>
          <input
            type="number"
            min="0"
            value={formData.displayOrder}
            onChange={(e) => handleChange('displayOrder', parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              background: 'white',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Toggles */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          padding: '12px',
          background: 'rgba(147, 51, 234, 0.05)',
          borderRadius: '12px',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#9333ea' }}
          />
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Active</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.isPopular}
            onChange={(e) => handleChange('isPopular', e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#9333ea' }}
          />
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Mark as Popular
          </span>
        </label>
      </div>

      {/* Features Section */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Features</label>
          <button
            type="button"
            onClick={handleAddFeature}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={14} />
            Add Feature
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {formData.features.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '14px' }}>
              No features yet. Click "Add Feature" to get started.
            </p>
          ) : (
            formData.features.map((feature, index) => (
              <PricingFeatureInput
                key={index}
                feature={feature}
                index={index}
                onChange={handleFeatureChange}
                onRemove={handleRemoveFeature}
              />
            ))
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            color: '#9333ea',
            fontWeight: '500',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
            color: 'white',
            fontWeight: '500',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
