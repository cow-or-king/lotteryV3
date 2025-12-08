'use client';

import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import { useState, useMemo } from 'react';

interface EditingSet {
  id: string;
  name: string;
  description: string;
  brandId: string;
}

interface SetFormData {
  brandId: string;
  name: string;
  description: string;
}

interface SelectedItem {
  prizeTemplateId: string;
  probability: number;
  quantity: number;
}

interface PrizeTemplate {
  id: string;
  brandId: string | null;
  name: string;
  description: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  color: string;
  iconUrl: string | null;
}

export function usePrizeSets(prizeTemplates: PrizeTemplate[] | undefined) {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSet, setEditingSet] = useState<EditingSet | null>(null);
  const [formData, setFormData] = useState<SetFormData>({
    brandId: '',
    name: '',
    description: '',
  });
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Queries
  const { data: prizeSets, isLoading } = api.prizeSet.list.useQuery();

  // Computed
  const totalProbability = selectedItems.reduce((sum, item) => sum + item.probability, 0);

  const availablePrizeTemplates = useMemo(() => {
    if (!prizeTemplates || !formData.brandId) return [];
    return prizeTemplates.filter(
      (template) => template.brandId === null || template.brandId === formData.brandId,
    );
  }, [prizeTemplates, formData.brandId]);

  const availablePrizeTemplatesForEdit = useMemo(() => {
    if (!prizeTemplates || !editingSet?.brandId) return [];
    return prizeTemplates.filter(
      (template) => template.brandId === null || template.brandId === editingSet.brandId,
    );
  }, [prizeTemplates, editingSet?.brandId]);

  // Mutations
  const utils = api.useUtils();

  const createSet = api.prizeSet.create.useMutation({
    onSuccess: async (data) => {
      if (selectedItems.length > 0) {
        try {
          for (const item of selectedItems) {
            await addItemToSet.mutateAsync({
              prizeSetId: data.id,
              prizeTemplateId: item.prizeTemplateId,
              probability: item.probability,
              quantity: item.quantity,
            });
          }
        } catch (error) {
          toast({
            title: 'Erreur',
            description: "Erreur lors de l'ajout des gains au lot",
            variant: 'error',
          });
        }
      }

      utils.prizeSet.list.invalidate();
      setShowCreateForm(false);
      setFormData({ brandId: '', name: '', description: '' });
      setSelectedItems([]);
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const updateSet = api.prizeSet.update.useMutation({
    onSuccess: async () => {
      utils.prizeSet.list.invalidate();
      setEditingSet(null);
      setSelectedItems([]);
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const deleteSet = api.prizeSet.delete.useMutation({
    onSuccess: () => {
      utils.prizeSet.list.invalidate();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const addItemToSet = api.prizeSet.addItem.useMutation({
    onSuccess: () => {
      utils.prizeSet.list.invalidate();
    },
  });

  const removeItemFromSet = api.prizeSet.removeItem.useMutation({
    onSuccess: () => {
      utils.prizeSet.list.invalidate();
    },
  });

  // Handlers
  const handleOpenCreateForm = (brands: Array<{ id: string }>) => {
    if (brands.length === 1) {
      setFormData({ ...formData, brandId: brands[0].id });
    }
    setSelectedItems([]);
    setShowCreateForm(true);
  };

  const handleTogglePrizeTemplate = (templateId: string) => {
    const exists = selectedItems.find((item) => item.prizeTemplateId === templateId);
    if (exists) {
      setSelectedItems(selectedItems.filter((item) => item.prizeTemplateId !== templateId));
    } else {
      setSelectedItems([
        ...selectedItems,
        { prizeTemplateId: templateId, probability: 0, quantity: 0 },
      ]);
    }
  };

  const handleUpdateItemProbability = (templateId: string, probability: number) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.prizeTemplateId === templateId ? { ...item, probability } : item,
      ),
    );
  };

  const handleUpdateItemQuantity = (templateId: string, quantity: number) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.prizeTemplateId === templateId ? { ...item, quantity } : item,
      ),
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createSet.mutate(formData);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSet) return;

    updateSet.mutate({
      id: editingSet.id,
      name: editingSet.name,
      description: editingSet.description,
    });

    try {
      const currentSet = prizeSets?.find((s) => s.id === editingSet.id);
      if (currentSet && currentSet.items) {
        for (const item of currentSet.items) {
          await removeItemFromSet.mutateAsync({
            prizeSetId: editingSet.id,
            prizeTemplateId: item.prizeTemplateId,
          });
        }
      }

      for (const item of selectedItems) {
        await addItemToSet.mutateAsync({
          prizeSetId: editingSet.id,
          prizeTemplateId: item.prizeTemplateId,
          probability: item.probability,
          quantity: item.quantity,
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour des gains du lot',
        variant: 'error',
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Supprimer le lot "${name}" ?`)) {
      deleteSet.mutate({ id });
    }
  };

  const handleEditSet = (set: {
    id: string;
    name: string;
    description: string | null;
    brandId: string;
    items?: Array<{
      prizeTemplateId: string;
      probability: number;
      quantity: number;
    }>;
  }) => {
    setEditingSet({
      id: set.id,
      name: set.name,
      description: set.description || '',
      brandId: set.brandId,
    });
    if (set.items) {
      setSelectedItems(
        set.items.map((item) => ({
          prizeTemplateId: item.prizeTemplateId,
          probability: item.probability,
          quantity: item.quantity,
        })),
      );
    }
  };

  return {
    // Data
    prizeSets,
    isLoading,
    // Form state
    showCreateForm,
    setShowCreateForm,
    editingSet,
    setEditingSet,
    formData,
    setFormData,
    selectedItems,
    setSelectedItems,
    totalProbability,
    availablePrizeTemplates,
    availablePrizeTemplatesForEdit,
    // Mutations
    createSet,
    updateSet,
    deleteSet,
    // Handlers
    handleOpenCreateForm,
    handleTogglePrizeTemplate,
    handleUpdateItemProbability,
    handleUpdateItemQuantity,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleEditSet,
  };
}
