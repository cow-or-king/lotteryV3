/**
 * Prizes Page
 * Page de gestion des gains et lots
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { useState, useMemo } from 'react';
import { api } from '@/lib/trpc/client';
import {
  Gift,
  Plus,
  X,
  Edit2,
  Trash2,
  Package,
  Coffee,
  Utensils,
  ShoppingBag,
  Percent,
  Star,
  Heart,
  Sparkles,
  TrendingUp,
  Award,
  CircleDollarSign,
} from 'lucide-react';

// Liste des icônes disponibles
const availableIcons = [
  { name: 'Coffee', icon: Coffee, label: 'Café' },
  { name: 'Utensils', icon: Utensils, label: 'Restaurant' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'Shopping' },
  { name: 'Percent', icon: Percent, label: 'Réduction' },
  { name: 'Gift', icon: Gift, label: 'Cadeau' },
  { name: 'Star', icon: Star, label: 'Étoile' },
  { name: 'Heart', icon: Heart, label: 'Cœur' },
  { name: 'Sparkles', icon: Sparkles, label: 'Sparkles' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'Tendance' },
  { name: 'Award', icon: Award, label: 'Récompense' },
  { name: 'CircleDollarSign', icon: CircleDollarSign, label: 'Prix' },
];

export default function PrizesPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'sets'>('templates');
  const [showCreateTemplateForm, setShowCreateTemplateForm] = useState(false);
  const [showCreateSetForm, setShowCreateSetForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{
    id: string;
    name: string;
    description: string;
    minPrice: number | null;
    maxPrice: number | null;
    color: string;
    iconUrl: string | null;
  } | null>(null);
  const [editingSet, setEditingSet] = useState<{
    id: string;
    name: string;
    description: string;
    brandId: string;
  } | null>(null);

  const [templateFormData, setTemplateFormData] = useState({
    brandId: '',
    name: '',
    description: '',
    minPrice: '',
    maxPrice: '',
    color: '#8B5CF6',
    iconUrl: '',
  });

  const [setFormData, setSetFormData] = useState({
    brandId: '',
    name: '',
    description: '',
  });

  const [selectedItems, setSelectedItems] = useState<
    Array<{ prizeTemplateId: string; probability: number; quantity: number }>
  >([]);

  // Récupérer les données
  const { data: prizeTemplates, isLoading: templatesLoading } = api.prizeTemplate.list.useQuery();
  const { data: prizeSets, isLoading: setsLoading } = api.prizeSet.list.useQuery();
  const { data: storesList } = api.store.list.useQuery();

  // Extraire les brands uniques des stores
  const brands = useMemo(() => {
    if (!storesList) return [];
    const brandMap = new Map();
    storesList.forEach((store: { brandId: string; brandName: string; logoUrl: string }) => {
      if (!brandMap.has(store.brandId)) {
        brandMap.set(store.brandId, {
          id: store.brandId,
          name: store.brandName,
          logoUrl: store.logoUrl,
        });
      }
    });
    return Array.from(brandMap.values());
  }, [storesList]);

  // Filtrer les gains par brand (pour création) - inclure gains communs + gains de la brand
  const availablePrizeTemplates = useMemo(() => {
    if (!prizeTemplates || !setFormData.brandId) return [];
    return prizeTemplates.filter(
      (template) => template.brandId === null || template.brandId === setFormData.brandId,
    );
  }, [prizeTemplates, setFormData.brandId]);

  // Filtrer les gains par brand (pour édition) - inclure gains communs + gains de la brand
  const availablePrizeTemplatesForEdit = useMemo(() => {
    if (!prizeTemplates || !editingSet?.brandId) return [];
    return prizeTemplates.filter(
      (template) => template.brandId === null || template.brandId === editingSet.brandId,
    );
  }, [prizeTemplates, editingSet?.brandId]);

  // Auto-select brand if only one exists (when opening create modal)
  const handleOpenCreateTemplateForm = () => {
    if (brands.length === 1) {
      setTemplateFormData({ ...templateFormData, brandId: brands[0].id });
    }
    setShowCreateTemplateForm(true);
  };

  const handleOpenCreateSetForm = () => {
    if (brands.length === 1) {
      setSetFormData({ ...setFormData, brandId: brands[0].id });
    }
    setSelectedItems([]);
    setShowCreateSetForm(true);
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

  const totalProbability = selectedItems.reduce((sum, item) => sum + item.probability, 0);

  // Mutations
  const utils = api.useUtils();

  const createTemplate = api.prizeTemplate.create.useMutation({
    onSuccess: () => {
      utils.prizeTemplate.list.invalidate();
      setShowCreateTemplateForm(false);
      setTemplateFormData({
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
      alert(error.message);
    },
  });

  const updateTemplate = api.prizeTemplate.update.useMutation({
    onSuccess: () => {
      utils.prizeTemplate.list.invalidate();
      setEditingTemplate(null);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const deleteTemplate = api.prizeTemplate.delete.useMutation({
    onSuccess: () => {
      utils.prizeTemplate.list.invalidate();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const createSet = api.prizeSet.create.useMutation({
    onSuccess: async (data) => {
      // Ajouter les items au lot créé
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
          alert("Erreur lors de l'ajout des gains au lot");
        }
      }

      utils.prizeSet.list.invalidate();
      setShowCreateSetForm(false);
      setSetFormData({ brandId: '', name: '', description: '' });
      setSelectedItems([]);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const addItemToSet = api.prizeSet.addItem.useMutation({
    onSuccess: () => {
      utils.prizeSet.list.invalidate();
    },
  });

  const updateSet = api.prizeSet.update.useMutation({
    onSuccess: async () => {
      utils.prizeSet.list.invalidate();
      setEditingSet(null);
      setSelectedItems([]);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const removeItemFromSet = api.prizeSet.removeItem.useMutation({
    onSuccess: () => {
      utils.prizeSet.list.invalidate();
    },
  });

  const deleteSet = api.prizeSet.delete.useMutation({
    onSuccess: () => {
      utils.prizeSet.list.invalidate();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const minPriceNum = templateFormData.minPrice
      ? parseFloat(templateFormData.minPrice)
      : undefined;
    const maxPriceNum = templateFormData.maxPrice
      ? parseFloat(templateFormData.maxPrice)
      : undefined;
    createTemplate.mutate({
      ...templateFormData,
      brandId: templateFormData.brandId === 'COMMON' ? null : templateFormData.brandId,
      minPrice: minPriceNum,
      maxPrice: maxPriceNum,
      iconUrl: templateFormData.iconUrl || undefined,
    });
  };

  const handleUpdateTemplate = (e: React.FormEvent) => {
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

  const handleCreateSet = (e: React.FormEvent) => {
    e.preventDefault();
    createSet.mutate(setFormData);
  };

  const handleUpdateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSet) return;

    // D'abord mettre à jour le set (nom, description)
    updateSet.mutate({
      id: editingSet.id,
      name: editingSet.name,
      description: editingSet.description,
    });

    // Ensuite gérer les items (supprimer tous et recréer)
    // Note: Dans une vraie app, on ferait un diff intelligent, mais pour simplifier on recrée tout
    try {
      // Récupérer le set actuel pour connaître les items existants
      const currentSet = prizeSets?.find((s) => s.id === editingSet.id);
      if (currentSet && currentSet.items) {
        // Supprimer tous les items existants
        for (const item of currentSet.items) {
          await removeItemFromSet.mutateAsync({
            prizeSetId: editingSet.id,
            prizeTemplateId: item.prizeTemplateId,
          });
        }
      }

      // Ajouter les nouveaux items
      for (const item of selectedItems) {
        await addItemToSet.mutateAsync({
          prizeSetId: editingSet.id,
          prizeTemplateId: item.prizeTemplateId,
          probability: item.probability,
          quantity: item.quantity,
        });
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour des gains du lot');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gains & Lots</h1>
          <p className="text-gray-600">Gérez vos gains et créez des lots personnalisés</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-purple-600/20">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'templates'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Mes Gains
          </div>
        </button>
        <button
          onClick={() => setActiveTab('sets')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'sets'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Mes Lots
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'templates' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleOpenCreateTemplateForm}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Créer un gain
            </button>
          </div>

          {templatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-6 w-32 bg-purple-100/30 rounded mb-4"></div>
                  <div className="h-4 w-full bg-purple-100/30 rounded"></div>
                </div>
              ))}
            </div>
          ) : prizeTemplates && prizeTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prizeTemplates.map((template) => {
                const templateBrand = template.brandId
                  ? brands.find((b) => b.id === template.brandId)
                  : null;
                return (
                  <div
                    key={template.id}
                    className="group bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 hover:bg-white/60 hover:border-purple-600/30 transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Header avec logo, titre et icône */}
                    <div className="flex items-center gap-3 mb-4">
                      {/* Brand indicator left */}
                      <div className="flex-shrink-0">
                        {template.brandId === null ? (
                          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-base border-2 border-white shadow-md">
                            C
                          </div>
                        ) : templateBrand?.logoUrl ? (
                          <img
                            src={templateBrand.logoUrl}
                            alt={templateBrand.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-100 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Title and description */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors truncate">
                          {template.name}
                        </h3>
                        {template.description && (
                          <p className="text-sm text-gray-600 truncate">{template.description}</p>
                        )}
                      </div>

                      {/* Icon right */}
                      <div className="flex-shrink-0">
                        {template.iconUrl ? (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: template.color, opacity: 0.9 }}
                          >
                            {(() => {
                              const iconConfig = availableIcons.find(
                                (i) => i.name === template.iconUrl,
                              );
                              if (iconConfig) {
                                const IconComponent = iconConfig.icon;
                                return <IconComponent className="w-6 h-6 text-white" />;
                              }
                              return null;
                            })()}
                          </div>
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full"
                            style={{ backgroundColor: template.color, opacity: 0.2 }}
                          ></div>
                        )}
                      </div>
                    </div>

                    <div className="text-2xl font-bold text-purple-600 mb-4 min-h-[2.5rem]">
                      {(template.minPrice !== null || template.maxPrice !== null) && (
                        <>
                          {template.minPrice !== null && template.maxPrice !== null
                            ? `entre ${template.minPrice.toFixed(2)}€ et ${template.maxPrice.toFixed(2)}€`
                            : template.minPrice !== null
                              ? `${template.minPrice.toFixed(2)}€`
                              : `${template.maxPrice!.toFixed(2)}€`}
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setEditingTemplate({
                            id: template.id,
                            name: template.name,
                            description: template.description || '',
                            minPrice: template.minPrice || null,
                            maxPrice: template.maxPrice || null,
                            color: template.color,
                            iconUrl: template.iconUrl || null,
                          })
                        }
                        className="flex-1 px-3 py-2 bg-purple-100 text-purple-600 rounded-lg font-semibold text-sm hover:bg-purple-200 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer le gain "${template.name}" ?`)) {
                            deleteTemplate.mutate({ id: template.id });
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-600/30 rounded-full flex items-center justify-center mb-6">
                <Gift className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Aucun gain</h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Créez vos premiers gains pour les utiliser dans vos campagnes.
              </p>
              <button
                onClick={handleOpenCreateTemplateForm}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Créer mon premier gain
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sets' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleOpenCreateSetForm}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Créer un lot
            </button>
          </div>

          {setsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-6 w-32 bg-purple-100/30 rounded mb-4"></div>
                  <div className="h-4 w-full bg-purple-100/30 rounded"></div>
                </div>
              ))}
            </div>
          ) : prizeSets && prizeSets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prizeSets.map((set) => (
                <div
                  key={set.id}
                  className="group bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 hover:bg-white/60 hover:border-purple-600/30 transition-all duration-300 hover:scale-[1.02] flex flex-col"
                >
                  <div className="mb-4 flex justify-between items-start gap-4">
                    <h3 className="text-lg font-bold text-purple-600 group-hover:text-purple-700 transition-colors">
                      {set.name}
                    </h3>
                    {set.description && (
                      <p className="text-sm text-gray-600 text-right flex-shrink-0 max-w-[50%]">
                        {set.description}
                      </p>
                    )}
                  </div>

                  <div className="mb-4 h-[84px] overflow-auto">
                    {set.items && set.items.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {set.items.map(
                          (item: {
                            prizeTemplate: { name: string };
                            probability: number;
                            quantity: number;
                          }) => (
                            <div
                              key={item.prizeTemplate.name}
                              className="flex items-center text-xs bg-purple-50 px-2 py-1 rounded"
                            >
                              <span className="font-medium text-gray-700 flex-1 truncate">
                                {item.prizeTemplate.name}
                              </span>
                              <span className="text-gray-600 flex-shrink-0 flex items-center gap-1">
                                <span className="w-6 text-right">
                                  {item.quantity === 0 ? '∞' : item.quantity}
                                </span>
                                <span>•</span>
                                <span className="w-8 text-left">{item.probability}%</span>
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic text-center">
                        Aucun gain configuré
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingSet({
                          id: set.id,
                          name: set.name,
                          description: set.description || '',
                          brandId: set.brandId,
                        });
                        // Charger les items du set
                        if (set.items) {
                          setSelectedItems(
                            set.items.map(
                              (item: {
                                prizeTemplateId: string;
                                probability: number;
                                quantity: number;
                              }) => ({
                                prizeTemplateId: item.prizeTemplateId,
                                probability: item.probability,
                                quantity: item.quantity,
                              }),
                            ),
                          );
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-purple-100 text-purple-600 rounded-lg font-semibold text-sm hover:bg-purple-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer le lot "${set.name}" ?`)) {
                          deleteSet.mutate({ id: set.id });
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-600/30 rounded-full flex items-center justify-center mb-6">
                <Package className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Aucun lot</h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Créez vos premiers lots en regroupant plusieurs gains.
              </p>
              <button
                onClick={handleOpenCreateSetForm}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Créer mon premier lot
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Create Template */}
      {showCreateTemplateForm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Nouveau gain</h2>
              <button
                onClick={() => setShowCreateTemplateForm(false)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-5">
              <div>
                <label htmlFor="brandId" className="block text-sm font-medium text-gray-700 mb-2">
                  Enseigne *
                </label>
                <select
                  id="brandId"
                  value={templateFormData.brandId}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, brandId: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Sélectionner...</option>
                  <option value="COMMON">🔄 Commun à toutes les enseignes</option>
                  {brands?.map((brand: { id: string; name: string; logoUrl: string }) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du gain *
                </label>
                <input
                  type="text"
                  id="name"
                  value={templateFormData.name}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="Ex: Café offert"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={templateFormData.description}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="Ex: Un café gratuit de votre choix"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="minPrice"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Prix minimum (€)
                  </label>
                  <input
                    type="number"
                    id="minPrice"
                    step="0.01"
                    value={templateFormData.minPrice}
                    onChange={(e) =>
                      setTemplateFormData({ ...templateFormData, minPrice: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    placeholder="Ex: 3.00"
                  />
                </div>
                <div>
                  <label
                    htmlFor="maxPrice"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Prix maximum (€)
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    step="0.01"
                    value={templateFormData.maxPrice}
                    onChange={(e) =>
                      setTemplateFormData({ ...templateFormData, maxPrice: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    placeholder="Ex: 5.00"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600 -mt-3">
                Optionnel - Laissez vide pour ne pas afficher de prix. Si vous remplissez les 2
                champs, le prix s'affichera sous forme de fourchette (ex: entre 3€ et 5€)
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icône</label>
                <div className="grid grid-cols-6 gap-2">
                  {availableIcons.map((iconConfig) => {
                    const IconComponent = iconConfig.icon;
                    return (
                      <button
                        key={iconConfig.name}
                        type="button"
                        onClick={() =>
                          setTemplateFormData({ ...templateFormData, iconUrl: iconConfig.name })
                        }
                        className={`p-3 rounded-lg border-2 transition-all ${
                          templateFormData.iconUrl === iconConfig.name
                            ? 'border-purple-600 bg-purple-100'
                            : 'border-purple-600/20 bg-white/50 hover:border-purple-600/40'
                        }`}
                        title={iconConfig.label}
                      >
                        <IconComponent className="w-5 h-5 text-purple-600 mx-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur
                </label>
                <input
                  type="color"
                  id="color"
                  value={templateFormData.color}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, color: e.target.value })
                  }
                  className="w-full h-12 px-4 py-2 bg-white/50 border border-purple-600/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                />
              </div>

              <div className="pt-4">
                <p className="text-xs text-gray-600 italic text-right mb-2">
                  * Champs obligatoires
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateTemplateForm(false)}
                    className="flex-1 px-4 py-3 bg-white/50 hover:bg-white/70 border border-purple-600/20 text-gray-700 rounded-xl font-semibold transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createTemplate.isPending}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {createTemplate.isPending ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Template */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Modifier le gain</h2>
              <button
                onClick={() => setEditingTemplate(null)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateTemplate} className="space-y-5">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du gain *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={editingTemplate.description}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-minPrice"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Prix minimum (€)
                  </label>
                  <input
                    type="number"
                    id="edit-minPrice"
                    step="0.01"
                    value={editingTemplate.minPrice || ''}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        minPrice: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    placeholder="Ex: 3.00"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-maxPrice"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Prix maximum (€)
                  </label>
                  <input
                    type="number"
                    id="edit-maxPrice"
                    step="0.01"
                    value={editingTemplate.maxPrice || ''}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        maxPrice: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    placeholder="Ex: 5.00"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600 -mt-3">
                Optionnel - Laissez vide pour ne pas afficher de prix. Si vous remplissez les 2
                champs, le prix s'affichera sous forme de fourchette
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icône</label>
                <div className="grid grid-cols-6 gap-2">
                  {availableIcons.map((iconConfig) => {
                    const IconComponent = iconConfig.icon;
                    return (
                      <button
                        key={iconConfig.name}
                        type="button"
                        onClick={() =>
                          setEditingTemplate({ ...editingTemplate, iconUrl: iconConfig.name })
                        }
                        className={`p-3 rounded-lg border-2 transition-all ${
                          editingTemplate.iconUrl === iconConfig.name
                            ? 'border-purple-600 bg-purple-100'
                            : 'border-purple-600/20 bg-white/50 hover:border-purple-600/40'
                        }`}
                        title={iconConfig.label}
                      >
                        <IconComponent className="w-5 h-5 text-purple-600 mx-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-color"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Couleur
                </label>
                <input
                  type="color"
                  id="edit-color"
                  value={editingTemplate.color}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, color: e.target.value })
                  }
                  className="w-full h-12 px-4 py-2 bg-white/50 border border-purple-600/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                />
              </div>

              <div className="pt-4">
                <p className="text-xs text-gray-600 italic text-right mb-2">
                  * Champs obligatoires
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="flex-1 px-4 py-3 bg-white/50 hover:bg-white/70 border border-purple-600/20 text-gray-700 rounded-xl font-semibold transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={updateTemplate.isPending}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {updateTemplate.isPending ? 'Modification...' : 'Modifier'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Create Set */}
      {showCreateSetForm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Nouveau lot</h2>
              <button
                onClick={() => setShowCreateSetForm(false)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateSet} className="space-y-5">
              <div>
                <label
                  htmlFor="set-brandId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enseigne *
                </label>
                <select
                  id="set-brandId"
                  value={setFormData.brandId}
                  onChange={(e) => setSetFormData({ ...setFormData, brandId: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Sélectionner une enseigne</option>
                  {brands?.map((brand: { id: string; name: string; logoUrl: string }) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="set-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du lot *
                </label>
                <input
                  type="text"
                  id="set-name"
                  value={setFormData.name}
                  onChange={(e) => setSetFormData({ ...setFormData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="Ex: Lot Printemps"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="set-description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="set-description"
                  value={setFormData.description}
                  onChange={(e) => setSetFormData({ ...setFormData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="Ex: Lot spécial pour la saison de printemps"
                  rows={3}
                />
              </div>

              {setFormData.brandId && availablePrizeTemplates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner les gains
                  </label>
                  <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-white/30 rounded-xl border border-purple-600/20">
                    {availablePrizeTemplates.map((template) => {
                      const selectedItem = selectedItems.find(
                        (item) => item.prizeTemplateId === template.id,
                      );
                      const isSelected = !!selectedItem;

                      return (
                        <div
                          key={template.id}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-purple-600/20 bg-white/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleTogglePrizeTemplate(template.id)}
                              className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">{template.name}</div>
                              {template.description && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {template.description}
                                </div>
                              )}

                              {isSelected && (
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Probabilité (%)
                                    </label>
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      value={selectedItem.probability}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(',', '.');
                                        const num = parseFloat(val);
                                        if (val === '' || (!isNaN(num) && num >= 0 && num <= 100)) {
                                          handleUpdateItemProbability(template.id, num || 0);
                                        }
                                      }}
                                      className="w-full px-3 py-2 bg-white border border-purple-600/20 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Quantité (0 = illimité)
                                    </label>
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      value={selectedItem.quantity}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const num = parseInt(val);
                                        if (val === '' || (!isNaN(num) && num >= 0)) {
                                          handleUpdateItemQuantity(template.id, num || 0);
                                        }
                                      }}
                                      className="w-full px-3 py-2 bg-white border border-purple-600/20 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                      placeholder="0 = illimité"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedItems.length > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Total des probabilités : </span>
                      <span
                        className={`font-bold ${
                          totalProbability === 100
                            ? 'text-green-600'
                            : totalProbability > 100
                              ? 'text-red-600'
                              : 'text-orange-600'
                        }`}
                      >
                        {totalProbability.toFixed(1)}%
                      </span>
                      {totalProbability !== 100 && (
                        <span className="text-xs text-gray-600 ml-2">(doit être égal à 100%)</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {setFormData.brandId && availablePrizeTemplates.length === 0 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
                  Aucun gain disponible pour cette enseigne. Créez d'abord des gains.
                </div>
              )}

              <div className="pt-4">
                <p className="text-xs text-gray-600 italic text-right mb-2">
                  * Champs obligatoires
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateSetForm(false)}
                    className="flex-1 px-4 py-3 bg-white/50 hover:bg-white/70 border border-purple-600/20 text-gray-700 rounded-xl font-semibold transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createSet.isPending || totalProbability !== 100}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {createSet.isPending ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Set */}
      {editingSet && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Modifier le lot</h2>
              <button
                onClick={() => {
                  setEditingSet(null);
                  setSelectedItems([]);
                }}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateSet} className="space-y-5">
              <div>
                <label
                  htmlFor="edit-set-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom du lot *
                </label>
                <input
                  type="text"
                  id="edit-set-name"
                  value={editingSet.name}
                  onChange={(e) => setEditingSet({ ...editingSet, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit-set-description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="edit-set-description"
                  value={editingSet.description}
                  onChange={(e) => setEditingSet({ ...editingSet, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  rows={3}
                />
              </div>

              {editingSet.brandId && availablePrizeTemplatesForEdit.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner les gains
                  </label>
                  <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-white/30 rounded-xl border border-purple-600/20">
                    {availablePrizeTemplatesForEdit.map((template) => {
                      const selectedItem = selectedItems.find(
                        (item) => item.prizeTemplateId === template.id,
                      );
                      const isSelected = !!selectedItem;

                      return (
                        <div
                          key={template.id}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-purple-600/20 bg-white/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleTogglePrizeTemplate(template.id)}
                              className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">{template.name}</div>
                              {template.description && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {template.description}
                                </div>
                              )}

                              {isSelected && (
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Probabilité (%)
                                    </label>
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      value={selectedItem.probability}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(',', '.');
                                        const num = parseFloat(val);
                                        if (val === '' || (!isNaN(num) && num >= 0 && num <= 100)) {
                                          handleUpdateItemProbability(template.id, num || 0);
                                        }
                                      }}
                                      className="w-full px-3 py-2 bg-white border border-purple-600/20 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Quantité (0 = illimité)
                                    </label>
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      value={selectedItem.quantity}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const num = parseInt(val);
                                        if (val === '' || (!isNaN(num) && num >= 0)) {
                                          handleUpdateItemQuantity(template.id, num || 0);
                                        }
                                      }}
                                      className="w-full px-3 py-2 bg-white border border-purple-600/20 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                      placeholder="0 = illimité"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedItems.length > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Total des probabilités : </span>
                      <span
                        className={`font-bold ${
                          totalProbability === 100
                            ? 'text-green-600'
                            : totalProbability > 100
                              ? 'text-red-600'
                              : 'text-orange-600'
                        }`}
                      >
                        {totalProbability.toFixed(1)}%
                      </span>
                      {totalProbability !== 100 && (
                        <span className="text-xs text-gray-600 ml-2">(doit être égal à 100%)</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4">
                <p className="text-xs text-gray-600 italic text-right mb-2">
                  * Champs obligatoires
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSet(null);
                      setSelectedItems([]);
                    }}
                    className="flex-1 px-4 py-3 bg-white/50 hover:bg-white/70 border border-purple-600/20 text-gray-700 rounded-xl font-semibold transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={updateSet.isPending || totalProbability !== 100}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {updateSet.isPending ? 'Modification...' : 'Modifier'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
