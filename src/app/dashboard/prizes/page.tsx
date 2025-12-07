/**
 * Prizes Page
 * Page de gestion des gains et lots
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { useState, useMemo } from 'react';
import { api } from '@/lib/trpc/client';
import { Gift, Plus, X, Edit2, Trash2, Package } from 'lucide-react';

export default function PrizesPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'sets'>('templates');
  const [showCreateTemplateForm, setShowCreateTemplateForm] = useState(false);
  const [showCreateSetForm, setShowCreateSetForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{
    id: string;
    name: string;
    description: string;
    value: number;
    color: string;
  } | null>(null);
  const [editingSet, setEditingSet] = useState<{
    id: string;
    name: string;
    description: string;
  } | null>(null);

  const [templateFormData, setTemplateFormData] = useState({
    brandId: '',
    name: '',
    description: '',
    value: 0,
    color: '#8B5CF6',
    iconUrl: '',
  });

  const [setFormData, setSetFormData] = useState({
    brandId: '',
    name: '',
    description: '',
  });

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
        value: 0,
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
    onSuccess: () => {
      utils.prizeSet.list.invalidate();
      setShowCreateSetForm(false);
      setSetFormData({ brandId: '', name: '', description: '' });
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const updateSet = api.prizeSet.update.useMutation({
    onSuccess: () => {
      utils.prizeSet.list.invalidate();
      setEditingSet(null);
    },
    onError: (error) => {
      alert(error.message);
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
    createTemplate.mutate(templateFormData);
  };

  const handleUpdateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    updateTemplate.mutate({
      id: editingTemplate.id,
      name: editingTemplate.name,
      description: editingTemplate.description,
      value: editingTemplate.value,
      color: editingTemplate.color,
    });
  };

  const handleCreateSet = (e: React.FormEvent) => {
    e.preventDefault();
    createSet.mutate(setFormData);
  };

  const handleUpdateSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSet) return;
    updateSet.mutate({
      id: editingSet.id,
      name: editingSet.name,
      description: editingSet.description,
    });
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
              onClick={() => setShowCreateTemplateForm(true)}
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
              {prizeTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 hover:bg-white/60 hover:border-purple-600/30 transition-all duration-300 hover:scale-[1.02] relative"
                >
                  <div
                    className="absolute top-4 right-4 w-12 h-12 rounded-full"
                    style={{ backgroundColor: template.color, opacity: 0.2 }}
                  ></div>

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors mb-1">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-gray-600">{template.description}</p>
                    )}
                  </div>

                  {template.value && (
                    <div className="text-2xl font-bold text-purple-600 mb-4">
                      {template.value.toFixed(2)}€
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setEditingTemplate({
                          id: template.id,
                          name: template.name,
                          description: template.description || '',
                          value: template.value || 0,
                          color: template.color,
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
              ))}
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
                onClick={() => setShowCreateTemplateForm(true)}
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
              onClick={() => setShowCreateSetForm(true)}
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
                  className="group bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 hover:bg-white/60 hover:border-purple-600/30 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors mb-1">
                      {set.name}
                    </h3>
                    {set.description && <p className="text-sm text-gray-600">{set.description}</p>}
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    {set.items.length} gain{set.items.length > 1 ? 's' : ''}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setEditingSet({
                          id: set.id,
                          name: set.name,
                          description: set.description || '',
                        })
                      }
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
                onClick={() => setShowCreateSetForm(true)}
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
                  <option value="">Sélectionner une enseigne</option>
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

              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                  Valeur (€)
                </label>
                <input
                  type="number"
                  id="value"
                  step="0.01"
                  value={templateFormData.value}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, value: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="2.50"
                />
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

              <div>
                <label
                  htmlFor="edit-value"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Valeur (€)
                </label>
                <input
                  type="number"
                  id="edit-value"
                  step="0.01"
                  value={editingTemplate.value}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, value: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                />
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
                    disabled={createSet.isPending}
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
          <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Modifier le lot</h2>
              <button
                onClick={() => setEditingSet(null)}
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

              <div className="pt-4">
                <p className="text-xs text-gray-600 italic text-right mb-2">
                  * Champs obligatoires
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingSet(null)}
                    className="flex-1 px-4 py-3 bg-white/50 hover:bg-white/70 border border-purple-600/20 text-gray-700 rounded-xl font-semibold transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={updateSet.isPending}
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
