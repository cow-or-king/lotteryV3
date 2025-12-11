'use client';

import { api } from '@/lib/trpc/client';
import { useState, useMemo } from 'react';
import type {
  EditingSet,
  SetFormData,
  SelectedItem,
  PrizeTemplate,
  PrizeSet,
} from '@/lib/types/prize-set.types';
import { usePrizeSetMutations } from './mutations/usePrizeSetMutations';
import {
  calculateTotalProbability,
  filterAvailablePrizeTemplates,
  togglePrizeTemplate,
  updateItemProbability,
  updateItemQuantity,
} from './utils/prizeSetHelpers';
import { useConfirm } from '@/hooks/ui/useConfirm';

export function usePrizeSets(prizeTemplates: PrizeTemplate[] | undefined) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSet, setEditingSet] = useState<EditingSet | null>(null);
  const [formData, setFormData] = useState<SetFormData>({
    brandId: '',
    name: '',
    description: '',
  });
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Hook de confirmation
  const { ConfirmDialogProps, confirm } = useConfirm();

  // Queries
  const { data: prizeSets, isLoading } = api.prizeSet.list.useQuery();

  // Computed
  const totalProbability = calculateTotalProbability(selectedItems);

  const availablePrizeTemplates = useMemo(
    () => filterAvailablePrizeTemplates(prizeTemplates, formData.brandId),
    [prizeTemplates, formData.brandId],
  );

  const availablePrizeTemplatesForEdit = useMemo(
    () => filterAvailablePrizeTemplates(prizeTemplates, editingSet?.brandId),
    [prizeTemplates, editingSet?.brandId],
  );

  // Mutations
  const { createSet, updateSet, createSetWithItems, updateSetWithItems, deleteSet } =
    usePrizeSetMutations({
      onCreateSuccess: () => {
        setShowCreateForm(false);
        setFormData({ brandId: '', name: '', description: '' });
        setSelectedItems([]);
      },
      onUpdateSuccess: () => {
        setEditingSet(null);
        setSelectedItems([]);
      },
    });

  // Handlers
  const handleOpenCreateForm = (brands: Array<{ id: string }>) => {
    if (brands.length === 1) {
      setFormData({ ...formData, brandId: brands[0]!.id });
    }
    setSelectedItems([]);
    setShowCreateForm(true);
  };

  const handleTogglePrizeTemplate = (templateId: string) => {
    setSelectedItems(togglePrizeTemplate(selectedItems, templateId));
  };

  const handleUpdateItemProbability = (templateId: string, probability: number) => {
    setSelectedItems(updateItemProbability(selectedItems, templateId, probability));
  };

  const handleUpdateItemQuantity = (templateId: string, quantity: number) => {
    setSelectedItems(updateItemQuantity(selectedItems, templateId, quantity));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createSetWithItems(formData, selectedItems);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSet) {
      return;
    }

    const currentSet = prizeSets?.find((s) => s.id === editingSet.id);
    const currentItems = currentSet?.items || [];

    await updateSetWithItems(
      editingSet.id,
      editingSet.name,
      editingSet.description,
      currentItems,
      selectedItems,
    );
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: "Supprimer l'ensemble de lots",
      message: `Êtes-vous sûr de vouloir supprimer l'ensemble de lots "${name}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'danger',
    });

    if (confirmed) {
      deleteSet.mutate({ id });
    }
  };

  const handleEditSet = (set: PrizeSet) => {
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
    // Confirm Dialog
    ConfirmDialogProps,
  };
}
