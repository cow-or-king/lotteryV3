/**
 * Stores Page
 * Page de gestion des commerces
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import {
  Store,
  Plus,
  MapPin,
  Calendar,
  X,
  Crown,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';

export default function StoresPage() {
  const searchParams = useSearchParams();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isNewBrand, setIsNewBrand] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openBrandMenuId, setOpenBrandMenuId] = useState<string | null>(null);
  const [editingStore, setEditingStore] = useState<{
    id: string;
    name: string;
    googleBusinessUrl: string;
  } | null>(null);
  const [editingBrand, setEditingBrand] = useState<{
    id: string;
    name: string;
    logoUrl: string;
  } | null>(null);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Ne fermer que si le clic n'est pas sur un bouton de menu ou dans un menu
      if (!target.closest('[data-menu-button]') && !target.closest('[data-menu-dropdown]')) {
        setOpenMenuId(null);
        setOpenBrandMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Ouvrir le modal si paramètre ?create=true
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreateForm(true);
    }
  }, [searchParams]);
  const [formData, setFormData] = useState({
    brandName: '',
    logoUrl: '',
    name: '',
    googleBusinessUrl: '',
  });
  const [errors, setErrors] = useState<{
    brandName?: string;
    logoUrl?: string;
    name?: string;
    googleBusinessUrl?: string;
  }>({});

  // Récupérer la liste des stores
  const { data: stores, isLoading } = api.store.list.useQuery();

  // Récupérer les limites du plan
  const { data: limits } = api.store.getLimits.useQuery();

  // Récupérer l'enseigne sélectionnée pour pré-remplir
  const selectedBrand = selectedBrandId
    ? stores?.find((s) => s.brandId === selectedBrandId)
    : stores && stores.length > 0
      ? stores[0]
      : null;

  // Pré-remplir le formulaire avec l'enseigne sélectionnée si elle existe
  useEffect(() => {
    if (selectedBrand && !isNewBrand) {
      setFormData((prev) => ({
        ...prev,
        brandName: selectedBrand.brandName,
        logoUrl: selectedBrand.logoUrl,
      }));
    } else if (isNewBrand) {
      setFormData((prev) => ({
        ...prev,
        brandName: '',
        logoUrl: '',
      }));
    }
  }, [selectedBrand, isNewBrand]);

  // Mutation pour créer un store
  const utils = api.useUtils();
  const createStore = api.store.create.useMutation({
    onSuccess: () => {
      // Rafraîchir la liste
      utils.store.list.invalidate();
      // Réinitialiser le formulaire
      setFormData({ brandName: '', logoUrl: '', name: '', googleBusinessUrl: '' });
      setErrors({});
      setShowCreateForm(false);
      setIsNewBrand(false);
      setSelectedBrandId(null);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  // Mutations pour store
  const deleteStore = api.store.delete.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      setOpenMenuId(null);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const updateStore = api.store.update.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      setEditingStore(null);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  // Mutations pour brand
  const deleteBrand = api.brand.delete.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      setOpenBrandMenuId(null);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const updateBrand = api.brand.update.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      setEditingBrand(null);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleDeleteStore = (storeId: string, storeName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le commerce "${storeName}" ?`)) {
      deleteStore.mutate({ id: storeId });
    }
  };

  const handleDeleteBrand = (brandId: string, brandName: string) => {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer l'enseigne "${brandName}" et tous ses commerces ?`,
      )
    ) {
      deleteBrand.mutate({ id: brandId });
    }
  };

  const handleUpdateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;

    updateStore.mutate({
      id: editingStore.id,
      name: editingStore.name,
      googleBusinessUrl: editingStore.googleBusinessUrl,
    });
  };

  const handleUpdateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;

    updateBrand.mutate({
      id: editingBrand.id,
      name: editingBrand.name,
      logoUrl: editingBrand.logoUrl,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation côté client
    const newErrors: {
      brandName?: string;
      logoUrl?: string;
      name?: string;
      googleBusinessUrl?: string;
    } = {};

    if (formData.brandName.length < 2) {
      newErrors.brandName = "Le nom de l'enseigne doit contenir au moins 2 caractères";
    }
    if (!formData.logoUrl.trim()) {
      newErrors.logoUrl = 'Le logo est obligatoire';
    } else if (!formData.logoUrl.match(/^https?:\/\/.+/)) {
      newErrors.logoUrl = 'URL du logo invalide';
    }
    if (formData.name.length < 2) {
      newErrors.name = 'Le nom du commerce doit contenir au moins 2 caractères';
    }
    if (!formData.googleBusinessUrl.trim()) {
      newErrors.googleBusinessUrl = "L'URL Google Business est obligatoire";
    } else if (
      !formData.googleBusinessUrl.includes('google.com') &&
      !formData.googleBusinessUrl.includes('maps.app.goo.gl') &&
      !formData.googleBusinessUrl.includes('g.page') &&
      !formData.googleBusinessUrl.includes('goo.gl/maps')
    ) {
      newErrors.googleBusinessUrl = 'URL Google Business invalide';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Si on utilise une enseigne existante, on passe le brandId
    if (selectedBrand && !isNewBrand) {
      createStore.mutate({
        brandId: selectedBrand.brandId,
        name: formData.name,
        googleBusinessUrl: formData.googleBusinessUrl,
      });
    } else {
      // Sinon on crée une nouvelle enseigne
      createStore.mutate({
        brandName: formData.brandName,
        name: formData.name,
        logoUrl: formData.logoUrl,
        googleBusinessUrl: formData.googleBusinessUrl,
      });
    }
  };

  // Organiser les stores par brand
  const brandGroups = stores?.reduce(
    (acc, store) => {
      const brandId = store.brandId;
      if (!acc[brandId]) {
        acc[brandId] = {
          brandId,
          brandName: store.brandName,
          logoUrl: store.logoUrl,
          stores: [],
        };
      }
      acc[brandId].stores.push(store);
      return acc;
    },
    {} as Record<
      string,
      { brandId: string; brandName: string; logoUrl: string; stores: typeof stores }
    >,
  );

  const brands = brandGroups ? Object.values(brandGroups) : [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Enseignes</h1>
          <p className="text-gray-600">Gérez vos enseignes et leurs commerces</p>
        </div>
        {brands.length > 0 && (
          <button
            onClick={() => {
              setIsNewBrand(true);
              setShowCreateForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Créer une enseigne
          </button>
        )}
      </div>

      {/* Liste des enseignes et leurs commerces */}
      {isLoading ? (
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 w-48 bg-purple-100/30 rounded mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6">
                  <div className="h-6 w-32 bg-purple-100/30 rounded mb-4"></div>
                  <div className="h-4 w-full bg-purple-100/30 rounded mb-2"></div>
                  <div className="h-4 w-3/4 bg-purple-100/30 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : brands.length > 0 ? (
        <div className="space-y-8">
          {brands.map((brand) => (
            <div key={brand.brandId}>
              {/* Header de l'enseigne */}
              <div className="flex items-center justify-between mb-4 relative">
                <div className="flex items-center gap-3">
                  <img
                    src={brand.logoUrl}
                    alt={brand.brandName}
                    className="w-10 h-10 rounded-xl object-cover border border-purple-600/30"
                  />
                  <h2 className="text-2xl font-bold text-gray-800">{brand.brandName}</h2>

                  {/* Menu 3 points pour l'enseigne */}
                  <button
                    data-menu-button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenBrandMenuId(openBrandMenuId === brand.brandId ? null : brand.brandId);
                    }}
                    className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Menu dropdown enseigne */}
                  {openBrandMenuId === brand.brandId && (
                    <div
                      data-menu-dropdown
                      className="absolute left-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-purple-600/20 py-2 z-10"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBrand({
                            id: brand.brandId,
                            name: brand.brandName,
                            logoUrl: brand.logoUrl,
                          });
                          setOpenBrandMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Modifier l'enseigne
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBrand(brand.brandId, brand.brandName);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer l'enseigne
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedBrandId(brand.brandId);
                    setIsNewBrand(false);
                    setShowCreateForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un commerce
                </button>
              </div>

              {/* Liste des commerces de cette enseigne */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brand.stores.map((store) => (
                  <div
                    key={store.id}
                    className="group bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 hover:bg-white/60 hover:border-purple-600/30 transition-all duration-300 hover:scale-[1.02] relative"
                  >
                    {/* Menu 3 points */}
                    <div className="absolute top-4 right-4">
                      <button
                        data-menu-button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === store.id ? null : store.id);
                        }}
                        className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {/* Menu dropdown */}
                      {openMenuId === store.id && (
                        <div
                          data-menu-dropdown
                          className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-purple-600/20 py-2 z-10"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingStore({
                                id: store.id,
                                name: store.name,
                                googleBusinessUrl: store.googleBusinessUrl,
                              });
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStore(store.id, store.name);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Nom du commerce */}
                    <div className="mb-4 pr-8">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors mb-1">
                        {store.name}
                      </h3>
                      <p className="text-xs text-gray-500">/{store.slug}</p>
                    </div>

                    {/* Google Business URL */}
                    <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <a
                        href={store.googleBusinessUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="line-clamp-1 hover:text-purple-600 transition-colors"
                      >
                        Google Business Profile
                      </a>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Créé le {new Date(store.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>

                    {/* Stats */}
                    <div className="pt-4 border-t border-purple-600/20 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Campagnes</p>
                        <p className="text-lg font-bold text-gray-800">0</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Participants</p>
                        <p className="text-lg font-bold text-gray-800">0</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty state (0 enseigne, 0 commerce)
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-600/30 rounded-full flex items-center justify-center mb-6">
            <Store className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Aucune enseigne</h3>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            Vous n'avez pas encore créé d'enseigne. Commencez par créer votre première enseigne et
            son premier commerce pour lancer vos campagnes.
          </p>
          <button
            onClick={() => {
              setIsNewBrand(true);
              setShowCreateForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Créer ma première enseigne
          </button>
        </div>
      )}

      {/* Modal de création */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 rounded-3xl">
          <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isNewBrand ? 'Nouvelle enseigne' : 'Nouveau commerce'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ brandName: '', logoUrl: '', name: '', googleBusinessUrl: '' });
                  setErrors({});
                  setIsNewBrand(false);
                  setSelectedBrandId(null);
                }}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Limites du plan FREE */}
            {limits && limits.plan === 'FREE' && !limits.canCreateStore && (
              <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800 mb-2">
                    Limite du plan gratuit atteinte
                  </h3>
                  <p className="text-sm text-gray-700 mb-4 max-w-sm">
                    Vous avez atteint la limite de {limits.maxBrands} enseigne et{' '}
                    {limits.maxStoresPerBrand} commerce en version gratuite.
                  </p>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 hover:scale-105 shadow-lg">
                    <Crown className="w-4 h-4" />
                    Passer au plan payant
                  </button>
                </div>
              </div>
            )}

            {/* Info sur les enseignes */}
            {limits &&
              limits.plan === 'FREE' &&
              limits.canCreateStore &&
              limits.brandsCount > 0 && (
                <div className="mb-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                      <AlertCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 mb-2">Plan gratuit</h3>
                    <p className="text-xs text-gray-700 mb-2">
                      Vous utilisez {limits.storesCount}/{limits.maxStoresPerBrand} commerce et{' '}
                      {limits.brandsCount}/{limits.maxBrands} enseigne.
                    </p>
                    {!limits.canCreateBrand && (
                      <p className="text-xs text-gray-700 mb-3">
                        Pour créer une nouvelle enseigne, vous devez passer à un plan payant.
                      </p>
                    )}
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-xs hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-md">
                      <Crown className="w-3.5 h-3.5" />
                      Voir les plans payants
                    </button>
                  </div>
                </div>
              )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Bouton Nouvelle enseigne - affiché seulement si une enseigne existe */}
              {selectedBrand && !isNewBrand && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedBrand.logoUrl}
                        alt={selectedBrand.brandName}
                        className="w-10 h-10 rounded-lg object-cover border border-purple-600/30"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {selectedBrand.brandName}
                        </p>
                        <p className="text-xs text-gray-600">Enseigne sélectionnée</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsNewBrand(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-xs hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Nouvelle enseigne
                    </button>
                  </div>
                </div>
              )}

              {/* Message nouvelle enseigne payante */}
              {isNewBrand && (
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl">
                  <div className="flex flex-col items-center text-center">
                    <Crown className="w-8 h-8 text-yellow-600 mb-2" />
                    <h3 className="text-sm font-bold text-gray-800 mb-1">
                      Nouvelle enseigne (payant)
                    </h3>
                    <p className="text-xs text-gray-700 mb-3">
                      La création d'une nouvelle enseigne nécessite un plan payant.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsNewBrand(false)}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                      ← Utiliser l'enseigne existante
                    </button>
                  </div>
                </div>
              )}

              {/* Nom de l'enseigne - affiché seulement si nouvelle enseigne OU première création */}
              {(isNewBrand || !selectedBrand) && (
                <>
                  <div>
                    <label
                      htmlFor="brandName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nom de l'enseigne *
                    </label>
                    <input
                      type="text"
                      id="brandName"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      placeholder="Ex: McDonald's"
                    />
                    {errors.brandName && (
                      <p className="text-red-600 text-sm mt-1">{errors.brandName}</p>
                    )}
                  </div>

                  {/* Logo URL */}
                  <div>
                    <label
                      htmlFor="logoUrl"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      URL du logo *
                    </label>
                    <input
                      type="url"
                      id="logoUrl"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      placeholder="https://example.com/logo.png"
                      required
                    />
                    {errors.logoUrl && (
                      <p className="text-red-600 text-sm mt-1">{errors.logoUrl}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      URL publique de votre logo (jpg, png, svg) - utilisée pour l'interface client
                    </p>
                  </div>
                </>
              )}

              {/* Nom du commerce */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du commerce *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="Ex: McDonald's Champs-Élysées"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Google Business URL */}
              <div>
                <label
                  htmlFor="googleBusinessUrl"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  URL Google Business Profile *
                </label>
                <input
                  type="url"
                  id="googleBusinessUrl"
                  value={formData.googleBusinessUrl}
                  onChange={(e) => setFormData({ ...formData, googleBusinessUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="https://maps.app.goo.gl/..."
                />
                {errors.googleBusinessUrl && (
                  <p className="text-red-600 text-sm mt-1">{errors.googleBusinessUrl}</p>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  URL de votre page Google Business (pour récupérer les avis)
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ brandName: '', logoUrl: '', name: '', googleBusinessUrl: '' });
                    setErrors({});
                    setIsNewBrand(false);
                    setSelectedBrandId(null);
                  }}
                  className="flex-1 px-4 py-3 bg-white/50 hover:bg-white/70 border border-purple-600/20 text-gray-700 rounded-xl font-semibold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createStore.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {createStore.isPending ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition de commerce */}
      {editingStore && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 rounded-3xl">
          <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Modifier le commerce</h2>
              <button
                onClick={() => setEditingStore(null)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateStore} className="space-y-5">
              <div>
                <label
                  htmlFor="edit-store-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom du commerce *
                </label>
                <input
                  type="text"
                  id="edit-store-name"
                  value={editingStore.name}
                  onChange={(e) => setEditingStore({ ...editingStore, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="Ex: McDonald's Champs-Élysées"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit-store-url"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  URL Google Business *
                </label>
                <input
                  type="url"
                  id="edit-store-url"
                  value={editingStore.googleBusinessUrl}
                  onChange={(e) =>
                    setEditingStore({ ...editingStore, googleBusinessUrl: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="https://g.page/..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingStore(null)}
                  className="flex-1 px-4 py-3 bg-white/50 hover:bg-white/70 border border-purple-600/20 text-gray-700 rounded-xl font-semibold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updateStore.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {updateStore.isPending ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition d'enseigne */}
      {editingBrand && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 rounded-3xl">
          <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Modifier l'enseigne</h2>
              <button
                onClick={() => setEditingBrand(null)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateBrand} className="space-y-5">
              <div>
                <label
                  htmlFor="edit-brand-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom de l'enseigne *
                </label>
                <input
                  type="text"
                  id="edit-brand-name"
                  value={editingBrand.name}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="Ex: McDonald's"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit-brand-logo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  URL du logo *
                </label>
                <input
                  type="url"
                  id="edit-brand-logo"
                  value={editingBrand.logoUrl}
                  onChange={(e) => setEditingBrand({ ...editingBrand, logoUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="https://example.com/logo.png"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  URL publique de votre logo (jpg, png, svg)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingBrand(null)}
                  className="flex-1 px-4 py-3 bg-white/50 hover:bg-white/70 border border-purple-600/20 text-gray-700 rounded-xl font-semibold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updateBrand.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {updateBrand.isPending ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
