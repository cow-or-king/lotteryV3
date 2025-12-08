/**
 * Stores Page
 * Page de gestion des commerces
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Crown,
  Edit2,
  HelpCircle,
  MapPin,
  MoreVertical,
  Plus,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function StoresPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isNewBrand, setIsNewBrand] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [showGoogleUrlHelp, setShowGoogleUrlHelp] = useState(false);
  const [showPlaceIdHelp, setShowPlaceIdHelp] = useState(false);
  const [showGoogleApiHelp, setShowGoogleApiHelp] = useState(false);
  const [showGoogleApiAccordion, setShowGoogleApiAccordion] = useState(false);
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
    googlePlaceId: '',
    googleApiKey: '',
  });
  const [errors, setErrors] = useState<{
    brandName?: string;
    logoUrl?: string;
    name?: string;
    googleBusinessUrl?: string;
    googlePlaceId?: string;
    googleApiKey?: string;
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
      setFormData({
        brandName: '',
        logoUrl: '',
        name: '',
        googleBusinessUrl: '',
        googlePlaceId: '',
        googleApiKey: '',
      });
      setErrors({});
      setShowCreateForm(false);
      setIsNewBrand(false);
      setSelectedBrandId(null);
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  // Mutations pour store
  const deleteStore = api.store.delete.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      setOpenMenuId(null);
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const updateStore = api.store.update.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      setEditingStore(null);
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  // Mutations pour brand
  const deleteBrand = api.brand.delete.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      setOpenBrandMenuId(null);
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const updateBrand = api.brand.update.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      setEditingBrand(null);
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
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
      googlePlaceId?: string;
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
    // Google Place ID est maintenant optionnel
    if (formData.googlePlaceId.trim() && !formData.googlePlaceId.startsWith('ChIJ')) {
      newErrors.googlePlaceId = 'Le Place ID doit commencer par "ChIJ"';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Si on utilise une enseigne existante, on passe le brandId
    if (selectedBrandId && !isNewBrand) {
      createStore.mutate({
        brandId: selectedBrandId,
        name: formData.name,
        googleBusinessUrl: formData.googleBusinessUrl,
        googlePlaceId: formData.googlePlaceId.trim() || undefined,
      });
    } else {
      // Sinon on crée une nouvelle enseigne
      createStore.mutate({
        brandName: formData.brandName,
        name: formData.name,
        logoUrl: formData.logoUrl,
        googleBusinessUrl: formData.googleBusinessUrl,
        googlePlaceId: formData.googlePlaceId.trim() || undefined,
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
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
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
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <h2 className="text-2xl font-bold text-purple-600">{brand.brandName}</h2>

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
                  className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-md"
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

                    {/* Google Business URL avec badge Avis vérifié/non vérifié */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <a
                          href={store.googleBusinessUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="line-clamp-1 hover:text-purple-600 transition-colors"
                        >
                          Google Business Profile
                        </a>
                      </div>

                      {/* Badge Avis vérifié/non vérifié - cliquable si non configuré */}
                      {!store.googlePlaceId || store.googlePlaceId.trim().length === 0 ? (
                        <a
                          href="/dashboard/reviews"
                          title="Cliquez pour configurer l'API Google et vérifier les avis"
                          className="flex items-center gap-1 px-2 py-1 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors cursor-pointer"
                        >
                          <AlertCircle className="w-3 h-3 text-orange-600 shrink-0" />
                          <span className="text-xs text-orange-800 font-medium">
                            Avis non vérifiés
                          </span>
                        </a>
                      ) : (
                        <div
                          title="API Google configurée - Les avis sont vérifiés"
                          className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-md"
                        >
                          <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
                          <span className="text-xs text-green-800 font-medium">Avis vérifiés</span>
                        </div>
                      )}
                    </div>

                    {/* Date + Badge IA */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Créé le {new Date(store.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>

                      {/* Badge IA - bientôt disponible */}
                      <div
                        title="L'assistance IA sera bientôt disponible"
                        className="flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-md"
                      >
                        <span className="text-xs text-purple-600 font-medium">
                          IA bientôt dispo
                        </span>
                      </div>
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
          <div className="w-24 h-24 bg-linear-to-br from-purple-600/20 to-pink-600/20 border border-purple-600/30 rounded-full flex items-center justify-center mb-6">
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
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
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
                  setFormData({
                    brandName: '',
                    logoUrl: '',
                    name: '',
                    googleBusinessUrl: '',
                    googlePlaceId: '',
                    googleApiKey: '',
                  });
                  setErrors({});
                  setIsNewBrand(false);
                  setSelectedBrandId(null);
                }}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Limites du plan FREE (mode dev: affichage informatif sans blocage) */}
            {limits && limits.plan === 'FREE' && !limits.canCreateStore && (
              <div className="mb-6 p-6 bg-linear-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl">
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
                  <p className="text-xs text-purple-700 italic">
                    (Mode développement : création autorisée pour test)
                  </p>
                </div>
              </div>
            )}

            {/* Info sur les enseignes */}
            {limits &&
              limits.plan === 'FREE' &&
              limits.canCreateStore &&
              limits.brandsCount > 0 && (
                <div className="mb-6 p-5 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl">
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
                  </div>
                </div>
              )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Bouton Nouvelle enseigne - affiché seulement si une enseigne existe */}
              {selectedBrand && !isNewBrand && (
                <div className="p-4 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl">
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
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-xs hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Nouvelle enseigne
                    </button>
                  </div>
                </div>
              )}

              {/* Message nouvelle enseigne payante */}
              {isNewBrand && (
                <div className="p-4 bg-linear-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl">
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
                  className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                >
                  URL Google Business Profile *
                  <button
                    type="button"
                    onClick={() => setShowGoogleUrlHelp(true)}
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                    title="Comment trouver mon URL ?"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </label>
                <input
                  type="url"
                  id="googleBusinessUrl"
                  value={formData.googleBusinessUrl}
                  onChange={(e) => setFormData({ ...formData, googleBusinessUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="Ex: https://g.page/r/ABC123.../review"
                />
                {errors.googleBusinessUrl && (
                  <p className="text-red-600 text-sm mt-1">{errors.googleBusinessUrl}</p>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  URL de votre page Google Business (pour laisser un avis)
                </p>
              </div>

              {/* Google API Configuration - Accordion */}
              <div className="border border-purple-600/20 rounded-2xl overflow-hidden">
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => setShowGoogleApiAccordion(!showGoogleApiAccordion)}
                  className="w-full p-4 bg-linear-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-gray-800">
                        Configuration API Google (optionnel)
                      </h4>
                      <p className="text-xs text-gray-600">
                        {showGoogleApiAccordion ? 'Cliquez pour fermer' : 'Cliquez pour configurer'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-600 transition-transform ${
                      showGoogleApiAccordion ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Warning when CLOSED */}
                {!showGoogleApiAccordion && (
                  <div className="p-4 bg-yellow-50 border-t border-yellow-200">
                    <p className="text-sm text-gray-700">
                      ⚠️ <strong>Sans API :</strong> Vous pourrez lancer des loteries, mais les
                      gains seront distribués sans vérifier qu'un avis a été publié. Avec l'API,
                      vous validez que chaque gagnant a bien laissé un avis Google.
                    </p>
                  </div>
                )}

                {/* Accordion Content when OPEN */}
                {showGoogleApiAccordion && (
                  <div className="p-4 bg-white/50 space-y-4">
                    {/* Info box with benefits */}
                    <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                      <h5 className="text-sm font-bold text-gray-800 mb-2">Avantages de l'API :</h5>
                      <ul className="text-xs text-gray-700 space-y-1 pl-4">
                        <li className="list-disc">
                          <strong>Vérification :</strong> Validez que chaque gagnant a publié un
                          avis
                        </li>
                        <li className="list-disc">
                          <strong>Synchronisation :</strong> Importez automatiquement vos avis
                          Google
                        </li>
                        <li className="list-disc">
                          <strong>Réponse :</strong> Répondez aux avis directement depuis
                          ReviewLottery
                        </li>
                        <li className="list-disc">
                          <strong>IA (bientôt) :</strong> Réponses automatiques et analyses
                          intelligentes
                        </li>
                      </ul>
                    </div>

                    {/* Google Place ID field */}
                    <div>
                      <label
                        htmlFor="googlePlaceId"
                        className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                      >
                        Google Place ID
                        <button
                          type="button"
                          onClick={() => setShowPlaceIdHelp(true)}
                          className="text-purple-600 hover:text-purple-700 transition-colors"
                          title="Comment trouver mon Place ID ?"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </label>
                      <input
                        type="text"
                        id="googlePlaceId"
                        value={formData.googlePlaceId}
                        onChange={(e) =>
                          setFormData({ ...formData, googlePlaceId: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        placeholder="Ex: ChIJ..."
                      />
                      {errors.googlePlaceId && (
                        <p className="text-red-600 text-sm mt-1">{errors.googlePlaceId}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        Permet de récupérer automatiquement les avis Google de votre établissement
                      </p>
                    </div>

                    {/* Google API Key field */}
                    <div>
                      <label
                        htmlFor="googleApiKey"
                        className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                      >
                        Google API Key
                        <button
                          type="button"
                          onClick={() => setShowGoogleApiHelp(true)}
                          className="text-purple-600 hover:text-purple-700 transition-colors"
                          title="Comment obtenir une clé API ?"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </label>
                      <input
                        type="password"
                        id="googleApiKey"
                        value={formData.googleApiKey}
                        onChange={(e) => setFormData({ ...formData, googleApiKey: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        placeholder="Votre clé API Google (optionnel)"
                      />
                      {errors.googleApiKey && (
                        <p className="text-red-600 text-sm mt-1">{errors.googleApiKey}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        🔒 Votre clé sera chiffrée (AES-256-GCM) avant stockage
                      </p>
                    </div>

                    {/* Yellow note */}
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-xs text-gray-700">
                        💡 Vous pouvez configurer cela plus tard depuis la section "Avis Google" si
                        vous voulez d'abord tester sans API.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-4">
                <p className="text-xs text-gray-600 italic text-right mb-2">
                  * Champs obligatoires
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({
                        brandName: '',
                        logoUrl: '',
                        name: '',
                        googleBusinessUrl: '',
                        googlePlaceId: '',
                        googleApiKey: '',
                      });
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
                    className="flex-1 px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {createStore.isPending ? 'Création...' : 'Créer'}
                  </button>
                </div>
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
              <div className="flex items-center gap-3">
                <img
                  src={
                    stores?.find((s) => s.id === editingStore.id)?.logoUrl ||
                    'https://via.placeholder.com/40'
                  }
                  alt="Logo"
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <h2 className="text-2xl font-bold text-purple-600">
                  {stores?.find((s) => s.id === editingStore.id)?.brandName || 'Modifier'}
                </h2>
              </div>
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
                  className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                >
                  URL Google Business *
                  <button
                    type="button"
                    onClick={() => setShowGoogleUrlHelp(true)}
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                    title="Comment trouver mon URL ?"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
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
                <p className="text-xs text-gray-600 mt-1">
                  URL de votre page Google Business (pour laisser un avis)
                </p>
              </div>

              {/* Info pour configurer Place ID dans /reviews */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  💡 Pour configurer le <strong>Google Place ID</strong> et l'
                  <strong>API Google</strong>, rendez-vous dans la section{' '}
                  <strong>Avis Google</strong>.
                </p>
              </div>

              {/* Buttons */}
              <div className="pt-4">
                <p className="text-xs text-gray-600 italic text-right mb-2">
                  * Champs obligatoires
                </p>
                <div className="flex gap-3">
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
                    className="flex-1 px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {updateStore.isPending ? 'Modification...' : 'Modifier'}
                  </button>
                </div>
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

              {/* Buttons */}
              <div className="pt-4">
                <p className="text-xs text-gray-600 italic text-right mb-2">
                  * Champs obligatoires
                </p>
                <div className="flex gap-3">
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
                    className="flex-1 px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {updateBrand.isPending ? 'Modification...' : 'Modifier'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: URL Google Business */}
      {showGoogleUrlHelp && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Comment trouver mon URL Google Business ?
                </h3>
                <button
                  onClick={() => setShowGoogleUrlHelp(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 text-gray-700">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-purple-600">
                    ⭐ URL pour poster un avis
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 pl-2">
                    <li>
                      Cherchez votre commerce sur <strong>Google</strong>
                    </li>
                    <li>
                      Avec votre compte <strong>Google Business</strong>, allez sur{' '}
                      <strong>Avis</strong>
                    </li>
                    <li>
                      Cliquez sur <strong>&quot;Recueillir plus d&apos;avis&quot;</strong>
                    </li>
                    <li>
                      Copiez le lien (type :{' '}
                      <code className="bg-purple-100 px-1.5 py-0.5 rounded text-xs">
                        https://g.page/r/.../review
                      </code>
                      )
                    </li>
                  </ol>
                  <div className="bg-gray-50 p-3 rounded-2xl mt-3">
                    <p className="text-sm font-mono text-gray-700">
                      Exemple : https://g.page/r/AbC123XyZ456DeF/review
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Astuce :</strong> Cette URL permet à vos clients de laisser un avis
                    Google directement après avoir participé à votre loterie.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowGoogleUrlHelp(false)}
                  className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Compris !
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Google Place ID */}
      {showPlaceIdHelp && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Comment trouver mon Google Place ID ?
                </h3>
                <button
                  onClick={() => setShowPlaceIdHelp(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 text-gray-700">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-purple-600">🔑 Google Place ID</h4>
                  <p className="mb-3">Pour récupérer automatiquement vos avis Google :</p>
                  <ol className="list-decimal list-inside space-y-2 pl-2 mb-3">
                    <li>
                      Allez sur{' '}
                      <a
                        href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        Place ID Finder
                      </a>
                    </li>
                    <li>Recherchez votre établissement</li>
                    <li>Cliquez sur le marqueur sur la carte</li>
                    <li>
                      Copiez le <strong>Place ID</strong> (commence par &quot;ChIJ...&quot;)
                    </li>
                  </ol>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-sm font-mono text-gray-700">
                      Exemple : ChIJAbCdEfGhIjKlMnOpQrStUvWx
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Astuce :</strong> Le Place ID permet de récupérer automatiquement les
                    avis, les photos et les informations de votre établissement depuis Google.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPlaceIdHelp(false)}
                  className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Compris !
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Google API Key */}
      {showGoogleApiHelp && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Comment obtenir une clé API Google ?
                </h3>
                <button
                  onClick={() => setShowGoogleApiHelp(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 text-gray-700">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-purple-600">
                    🔐 Créer votre clé API Google My Business
                  </h4>
                  <ol className="list-decimal list-inside space-y-3 pl-2">
                    <li>
                      Allez sur la{' '}
                      <a
                        href="https://console.cloud.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline font-semibold"
                      >
                        Console Google Cloud
                      </a>
                    </li>
                    <li>Créez un nouveau projet ou sélectionnez un projet existant</li>
                    <li>
                      Dans le menu de gauche, allez dans{' '}
                      <strong>&quot;APIs & Services&quot; → &quot;Bibliothèque&quot;</strong>
                    </li>
                    <li>
                      Recherchez et activez <strong>&quot;Google My Business API&quot;</strong> et{' '}
                      <strong>&quot;Places API&quot;</strong>
                    </li>
                    <li>
                      Allez dans <strong>&quot;Identifiants&quot;</strong> dans le menu de gauche
                    </li>
                    <li>
                      Cliquez sur <strong>&quot;Créer des identifiants&quot;</strong> →{' '}
                      <strong>&quot;Clé API&quot;</strong>
                    </li>
                    <li>Copiez la clé générée et collez-la dans le champ ci-dessus</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-4">
                  <p className="text-sm text-yellow-900 font-semibold mb-2">
                    ⚠️ Sécurité importante
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-1 pl-4">
                    <li className="list-disc">
                      Limitez votre clé API à votre domaine uniquement dans la console Google
                    </li>
                    <li className="list-disc">Ne partagez jamais votre clé API publiquement</li>
                    <li className="list-disc">
                      ReviewLottery chiffre votre clé avec AES-256-GCM avant stockage
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Pourquoi c&apos;est nécessaire ?</strong> L&apos;API Google vous
                    permet de synchroniser automatiquement vos avis, de vérifier qu&apos;un
                    participant a bien laissé un avis, et de répondre aux avis directement depuis
                    ReviewLottery.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowGoogleApiHelp(false)}
                  className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Compris !
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upgrade Plan (Informatif en mode dev) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Limite du plan gratuit atteinte
                </h3>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6 p-6 bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <Crown className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">Passez au plan supérieur</h4>
                  <p className="text-sm text-gray-700 mb-4">
                    Vous avez atteint la limite de <strong>{limits?.maxBrands} enseigne</strong> et{' '}
                    <strong>{limits?.maxStoresPerBrand} commerce</strong> du plan gratuit.
                  </p>
                  <p className="text-xs text-purple-700 italic mb-4">
                    (Mode développement : création autorisée pour test)
                  </p>
                  <p className="text-sm text-gray-700 mb-4">
                    Passez au <strong>plan Starter</strong> pour débloquer :
                  </p>
                  <ul className="text-sm text-gray-700 space-y-2 mb-6 text-left w-full">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>
                        Jusqu'à <strong>3 enseignes</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>
                        Jusqu'à <strong>10 commerces par enseigne</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>Campagnes illimitées</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>Support prioritaire</span>
                    </li>
                  </ul>
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold text-base hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 hover:scale-105 shadow-lg">
                    <Crown className="w-5 h-5" />
                    Voir les plans payants
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Continuer avec le plan gratuit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
