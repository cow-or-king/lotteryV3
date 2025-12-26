/**
 * Hook for managing pricing configuration
 * IMPORTANT: ZERO any types
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/rbac/usePermissions';
import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';

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
  features: Array<{
    id: string;
    text: string;
    isIncluded: boolean;
    isEmphasized: boolean;
    displayOrder: number;
  }>;
}

type ModalMode = 'create' | 'edit' | null;

export function usePricingConfig() {
  const router = useRouter();
  const { isSuperAdmin } = usePermissions();
  const { toast } = useToast();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<PricingPlan | null>(null);

  const utils = api.useUtils();

  // Queries
  const { data: plans, isLoading } = api.pricing.getAll.useQuery(undefined, {
    enabled: true,
  });

  // Mutations
  const createPlan = api.pricing.create.useMutation({
    onSuccess: () => {
      utils.pricing.getAll.invalidate();
      setModalMode(null);
      toast({
        title: 'Plan Created',
        description: 'Pricing plan created successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create pricing plan',
        variant: 'error',
      });
    },
  });

  const updatePlan = api.pricing.update.useMutation({
    onSuccess: () => {
      utils.pricing.getAll.invalidate();
      setModalMode(null);
      setEditingPlan(null);
      toast({
        title: 'Plan Updated',
        description: 'Pricing plan updated successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update pricing plan',
        variant: 'error',
      });
    },
  });

  const deletePlan = api.pricing.delete.useMutation({
    onSuccess: () => {
      utils.pricing.getAll.invalidate();
      setDeletingPlan(null);
      toast({
        title: 'Plan Deleted',
        description: 'Pricing plan deleted successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete pricing plan',
        variant: 'error',
      });
    },
  });

  const toggleActive = api.pricing.toggleActive.useMutation({
    onSuccess: () => {
      utils.pricing.getAll.invalidate();
      toast({
        title: 'Status Updated',
        description: 'Plan status updated successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update plan status',
        variant: 'error',
      });
    },
  });

  const updateDisplayOrder = api.pricing.updateDisplayOrder.useMutation({
    onSuccess: () => {
      utils.pricing.getAll.invalidate();
      toast({
        title: 'Order Updated',
        description: 'Display order updated successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update display order',
        variant: 'error',
      });
    },
  });

  // Redirect if not SUPER_ADMIN
  useEffect(() => {
    if (!isSuperAdmin()) {
      router.push('/dashboard');
    }
  }, [isSuperAdmin, router]);

  // Handlers
  const handleCreateNew = () => {
    setModalMode('create');
    setEditingPlan(null);
  };

  const handleEdit = (plan: PricingPlan) => {
    setModalMode('edit');
    setEditingPlan(plan);
  };

  const handleDelete = (plan: PricingPlan) => {
    setDeletingPlan(plan);
  };

  const handleToggleActive = (plan: PricingPlan) => {
    toggleActive.mutate({
      id: plan.id,
      isActive: !plan.isActive,
    });
  };

  const handleMoveUp = (plan: PricingPlan) => {
    if (!plans) {
      return;
    }

    const currentIndex = plans.findIndex((p) => p.id === plan.id);
    if (currentIndex <= 0) {
      return;
    }

    const previousPlan = plans[currentIndex - 1];
    if (!previousPlan) {
      return;
    }

    updateDisplayOrder.mutate({
      planOrders: [
        { id: plan.id, displayOrder: previousPlan.displayOrder },
        { id: previousPlan.id, displayOrder: plan.displayOrder },
      ],
    });
  };

  const handleMoveDown = (plan: PricingPlan) => {
    if (!plans) {
      return;
    }

    const currentIndex = plans.findIndex((p) => p.id === plan.id);
    if (currentIndex === -1 || currentIndex >= plans.length - 1) {
      return;
    }

    const nextPlan = plans[currentIndex + 1];
    if (!nextPlan) {
      return;
    }

    updateDisplayOrder.mutate({
      planOrders: [
        { id: plan.id, displayOrder: nextPlan.displayOrder },
        { id: nextPlan.id, displayOrder: plan.displayOrder },
      ],
    });
  };

  const handleSubmit = (formData: PricingPlanFormData) => {
    const features = formData.features.map((f, index) => ({
      text: f.text,
      isIncluded: f.isIncluded,
      isEmphasized: f.isEmphasized,
      displayOrder: index,
    }));

    const baseData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      monthlyPrice: formData.monthlyPrice ? parseFloat(formData.monthlyPrice) : null,
      annualPrice: formData.annualPrice ? parseFloat(formData.annualPrice) : null,
      currency: formData.currency,
      isActive: formData.isActive,
      isPopular: formData.isPopular,
      displayOrder: formData.displayOrder,
      ctaText: formData.ctaText,
      ctaHref: formData.ctaHref,
      badgeText: formData.badgeText || null,
      features,
    };

    if (modalMode === 'create') {
      createPlan.mutate(baseData);
    } else if (modalMode === 'edit' && editingPlan) {
      updatePlan.mutate({
        id: editingPlan.id,
        ...baseData,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingPlan) {
      return;
    }
    deletePlan.mutate({ id: deletingPlan.id });
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingPlan(null);
  };

  const handleCancelDelete = () => {
    setDeletingPlan(null);
  };

  // Convert plan to form data
  const getFormData = (plan: PricingPlan | null): PricingPlanFormData | undefined => {
    if (!plan) {
      return undefined;
    }

    return {
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice?.toString() || '',
      annualPrice: plan.annualPrice?.toString() || '',
      currency: plan.currency,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      displayOrder: plan.displayOrder,
      ctaText: plan.ctaText,
      ctaHref: plan.ctaHref,
      badgeText: plan.badgeText || '',
      features: plan.features.map((f) => ({
        text: f.text,
        isIncluded: f.isIncluded,
        isEmphasized: f.isEmphasized,
        displayOrder: f.displayOrder,
      })),
    };
  };

  return {
    isSuperAdmin: isSuperAdmin(),
    plans: plans || [],
    isLoading,
    modalMode,
    editingPlan,
    deletingPlan,
    isDeleting: deletePlan.isPending,
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
  };
}
