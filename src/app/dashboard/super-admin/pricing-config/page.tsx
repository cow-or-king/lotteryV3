/**
 * Pricing Configuration Page
 * Super Admin interface for managing pricing plans
 * IMPORTANT: ZERO any types
 */

'use client';

import { usePricingConfig } from './hooks/usePricingConfig';
import { PricingConfigHeader } from './components/PricingConfigHeader';
import { PricingPlanCard } from './components/PricingPlanCard';
import { PricingPlanModal } from './components/PricingPlanModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

export default function PricingConfigPage() {
  const {
    isSuperAdmin,
    plans,
    isLoading,
    modalMode,
    editingPlan,
    deletingPlan,
    isDeleting,
    handleCreateNew,
    handleEdit,
    handleDelete,
    handleToggleActive,
    handleMoveUp,
    handleMoveDown,
    handleSubmit,
    handleConfirmDelete,
    handleCloseModal,
    handleCancelDelete,
    getFormData,
  } = usePricingConfig();

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <PricingConfigHeader onCreateNew={handleCreateNew} />

      {/* Loading State */}
      {isLoading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px 20px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(147, 51, 234, 0.2)',
              borderTop: '4px solid #9333ea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}

      {/* Plans Grid */}
      {!isLoading && plans.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '30px',
          }}
        >
          {plans.map((plan, index) => (
            <PricingPlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              canMoveUp={index > 0}
              canMoveDown={index < plans.length - 1}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && plans.length === 0 && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            padding: '60px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(147, 51, 234, 0.3)',
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h2
            style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
            }}
          >
            No Pricing Plans Yet
          </h2>
          <p
            style={{
              margin: '0 0 24px 0',
              fontSize: '14px',
              color: '#6b7280',
              maxWidth: '400px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Create your first pricing plan to get started. You can define features, pricing, and
            more.
          </p>
          <button
            onClick={handleCreateNew}
            style={{
              padding: '12px 32px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
              color: 'white',
              fontWeight: '600',
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
            Create First Plan
          </button>
        </div>
      )}

      {/* Info Banner */}
      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: '#1f2937',
            lineHeight: '1.6',
          }}
        >
          <strong>ℹ️ How it works:</strong> Create and manage pricing plans that will be displayed
          on your public pricing page. Use the display order to control the sequence. Mark a plan as
          "Popular" to highlight it. Active plans are visible to the public, while inactive plans
          are hidden.
        </p>
      </div>

      {/* Create/Edit Modal */}
      {modalMode && (
        <PricingPlanModal
          mode={modalMode}
          initialData={getFormData(editingPlan)}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingPlan && (
        <DeleteConfirmModal
          plan={deletingPlan}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />
      )}

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
