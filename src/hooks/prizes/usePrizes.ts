'use client';

import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import { useState } from 'react';

interface EditingTemplate {
  id: string;
  name: string;
  description: string;
  minPrice: number | null;
  maxPrice: number | null;
  color: string;
  iconUrl: string | null;
}

interface TemplateFormData {
  brandId: string;
  name: string;
  description: string;
  minPrice: string;
  maxPrice: string;
  color: string;
  iconUrl: string;
}

export function usePrizes() {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EditingTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    brandId: '',
    name: '',
    description: '',
    minPrice: '',
    maxPrice: '',
    color: '#8B5CF6',
    iconUrl: '',
  });

  // Queries
  const { data: prizeTemplates, isLoading } = api.prizeTemplate.list.useQuery();

  // Mutations
  const utils = api.useUtils();

  const createTemplate = api.prizeTemplate.create.useMutation({
    onSuccess: () => {
      utils.prizeTemplate.list.invalidate();
      setShowCreateForm(false);
      setFormData({
        brandId: '',
        name: '',
        description: '',
        minPrice: '',
        maxPrice: '',
        color: '#8B5CF6',
        iconUrl: '',
      });
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const updateTemplate = api.prizeTemplate.update.useMutation({
    onSuccess: () => {
      utils.prizeTemplate.list.invalidate();
      setEditingTemplate(null);
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const deleteTemplate = api.prizeTemplate.delete.useMutation({
    onSuccess: () => {
      utils.prizeTemplate.list.invalidate();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  // Handlers
  const handleOpenCreateForm = (brands: Array<{ id: string }>) => {
    if (brands.length === 1) {
      setFormData({ ...formData, brandId: brands[0]!.id });
    }
    setShowCreateForm(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const minPriceNum = formData.minPrice ? parseFloat(formData.minPrice) : undefined;
    const maxPriceNum = formData.maxPrice ? parseFloat(formData.maxPrice) : undefined;
    createTemplate.mutate({
      ...formData,
      brandId: formData.brandId === 'COMMON' ? null : formData.brandId,
      minPrice: minPriceNum,
      maxPrice: maxPriceNum,
      iconUrl: formData.iconUrl || undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    updateTemplate.mutate({
      id: editingTemplate.id,
      name: editingTemplate.name,
      description: editingTemplate.description,
      minPrice: editingTemplate.minPrice || undefined,
      maxPrice: editingTemplate.maxPrice || undefined,
      color: editingTemplate.color,
      iconUrl: editingTemplate.iconUrl || undefined,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Supprimer le gain "${name}" ?`)) {
      deleteTemplate.mutate({ id });
    }
  };

  return {
    // Data
    prizeTemplates,
    isLoading,
    // Form state
    showCreateForm,
    setShowCreateForm,
    editingTemplate,
    setEditingTemplate,
    formData,
    setFormData,
    // Mutations
    createTemplate,
    updateTemplate,
    deleteTemplate,
    // Handlers
    handleOpenCreateForm,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
