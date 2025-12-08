/**
 * Reviews Page
 * Page de gestion des avis Google
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import {
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Settings,
  Sparkles,
  Star,
  Store as StoreIcon,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';

export default function ReviewsPage() {
  const { toast } = useToast();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [showApiConfigModal, setShowApiConfigModal] = useState(false);
  const [showPlaceIdHelp, setShowPlaceIdHelp] = useState(false);
  const [showGoogleApiHelp, setShowGoogleApiHelp] = useState(false);
  const [apiFormData, setApiFormData] = useState({
    googlePlaceId: '',
    googleApiKey: '',
  });
  const [apiFormErrors, setApiFormErrors] = useState<{
    googlePlaceId?: string;
    googleApiKey?: string;
  }>({});

  // Récupérer la liste des stores
  const { data: stores, isLoading: storesLoading } = api.store.list.useQuery();

  // Récupérer les statistiques d'avis pour le store sélectionné
  const { data: stats } = api.review.getStats.useQuery(
    { storeId: selectedStoreId! },
    { enabled: !!selectedStoreId },
  );

  // Récupérer la liste des avis pour le store sélectionné
  const { data: reviewsData } = api.review.listByStore.useQuery(
    { storeId: selectedStoreId!, limit: 20, offset: 0 },
    { enabled: !!selectedStoreId },
  );

  const utils = api.useUtils();

  // Mutation pour mettre à jour l'API config du store
  const updateStoreApi = api.store.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Configuration enregistrée',
        description: 'Votre clé API Google a été configurée avec succès',
      });
      setShowApiConfigModal(false);
      setApiFormData({ googlePlaceId: '', googleApiKey: '' });
      setApiFormErrors({});
      // Rafraîchir les données
      utils.store.list.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Erreur de configuration',
        description: error.message,
        variant: 'error',
      });
    },
  });

  // Mutation pour synchroniser les avis
  const syncReviews = api.review.sync.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Synchronisation réussie',
        description: `${data.synchronized} avis synchronisés avec succès`,
      });
      // Invalider les queries pour rafraîchir les données
      utils.review.getStats.invalidate();
      utils.review.listByStore.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Erreur de synchronisation',
        description: error.message,
        variant: 'error',
      });
    },
  });

  const handleSync = () => {
    if (!selectedStoreId) {
      toast({
        title: 'Aucun commerce sélectionné',
        description: 'Veuillez sélectionner un commerce pour synchroniser ses avis',
        variant: 'error',
      });
      return;
    }

    syncReviews.mutate({ storeId: selectedStoreId });
  };

  const handleApiConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStoreId) {
      toast({
        title: 'Erreur',
        description: 'Aucun commerce sélectionné',
        variant: 'error',
      });
      return;
    }

    // Validation
    const newErrors: typeof apiFormErrors = {};

    if (apiFormData.googlePlaceId.trim() && !apiFormData.googlePlaceId.startsWith('ChIJ')) {
      newErrors.googlePlaceId = 'Le Place ID doit commencer par "ChIJ"';
    }

    if (Object.keys(newErrors).length > 0) {
      setApiFormErrors(newErrors);
      return;
    }

    // Mettre à jour le store
    updateStoreApi.mutate({
      id: selectedStoreId,
      googlePlaceId: apiFormData.googlePlaceId.trim() || undefined,
      googleApiKey: apiFormData.googleApiKey.trim() || undefined,
    });
  };

  // Sélectionner automatiquement le premier store si disponible
  React.useEffect(() => {
    if (stores && stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0]?.id ?? null);
    }
  }, [stores, selectedStoreId]);

  // Trouver le store sélectionné pour vérifier l'API key
  const selectedStore = stores?.find((s) => s.id === selectedStoreId);

  // IMPORTANT: En mode mock (dev), on a juste besoin du Place ID
  // En production, on a besoin du Place ID ET de l'API Key
  const useMockService = process.env.NEXT_PUBLIC_USE_MOCK_GOOGLE_SERVICE === 'true';
  const hasApiKey = useMockService
    ? selectedStore?.googlePlaceId && selectedStore.googlePlaceId.trim().length > 0
    : selectedStore?.googlePlaceId &&
      selectedStore.googlePlaceId.trim().length > 0 &&
      selectedStore?.googleApiKeyStatus === 'configured';

  // Compter les commerces avec et sans API (basé sur googlePlaceId qui indique si configuré)
  const storesWithoutApi =
    stores?.filter((s) => {
      if (useMockService) {
        return !s.googlePlaceId || s.googlePlaceId.length === 0;
      }
      return (
        !s.googlePlaceId || s.googlePlaceId.length === 0 || s.googleApiKeyStatus !== 'configured'
      );
    }) || [];
  const isSingleStoreWithoutApi = stores && stores.length === 1 && storesWithoutApi.length === 1;

  return (
    <div>
      {/* Header */}
      {!isSingleStoreWithoutApi && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Avis Google</h1>
            <p className="text-gray-600">Gérez et répondez aux avis de vos clients</p>
          </div>
        </div>
      )}

      {/* Sélecteur de Store + Bouton Sync - masqué si un seul commerce sans API */}
      {!isSingleStoreWithoutApi && (
        <div className="mb-8 p-6 bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Sélecteur de Store */}
            <div className="flex-1">
              <label
                htmlFor="store-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sélectionner un commerce
              </label>
              <div className="relative">
                <StoreIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="store-select"
                  value={selectedStoreId || ''}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  disabled={storesLoading || !stores || stores.length === 0}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-purple-600/20 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {storesLoading && <option value="">Chargement...</option>}
                  {!storesLoading && (!stores || stores.length === 0) && (
                    <option value="">Aucun commerce disponible</option>
                  )}
                  {stores &&
                    stores.length > 0 &&
                    stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.brandName} - {store.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Bouton Synchroniser */}
            <div className="flex items-end">
              <button
                onClick={handleSync}
                disabled={!selectedStoreId || syncReviews.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <RefreshCw className={`w-5 h-5 ${syncReviews.isPending ? 'animate-spin' : ''}`} />
                {syncReviews.isPending ? 'Synchronisation...' : 'Synchroniser'}
              </button>
            </div>
          </div>

          {/* Message d'aide */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              💡 <strong>Mode développement :</strong> Le système utilise actuellement des avis de
              test. Cliquez sur "Synchroniser" pour charger 10 avis français fictifs et tester
              l'interface.
            </p>
          </div>
        </div>
      )}

      {/* Message si pas d'API Key configurée */}
      {selectedStoreId && !hasApiKey && (
        <div className="flex flex-col items-center justify-center ">
          <div className="max-w-3xl mx-auto">
            {/* Icône principale */}
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-linear-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-600/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-purple-600" />
              </div>
            </div>

            {/* Titre et description */}
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Configuration Google API requise
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Pour synchroniser et gérer vos avis Google, vous devez configurer votre clé API
                Google My Business.
              </p>
            </div>

            {/* Avantages */}
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              {/* Avantages immédiats */}
              <div className="p-4 bg-white/50 backdrop-blur-xl border-2 border-green-600/30 rounded-2xl">
                <div className="flex flex-col items-start gap-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Avantages immédiats</h3>
                  </div>

                  <div>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Synchronisation automatique de vos vrais avis Google</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Vue centralisée de tous vos avis</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Statistiques détaillées en temps réel</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Gestion simplifiée des réponses</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Avantages futurs avec IA */}
              <div className="p-4 bg-linear-to-br from-purple-50 to-pink-50 border-2 border-purple-600/30 rounded-2xl relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-linear-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
                    BIENTÔT
                  </span>
                </div>
                <div className="flex flex-col items-start gap-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Avec l&apos;IA</h3>
                  </div>

                  <div>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">★</span>
                        <span>Réponses automatiques personnalisées par IA</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">★</span>
                        <span>Analyse de sentiment avancée</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">★</span>
                        <span>Suggestions de réponses intelligentes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">★</span>
                        <span>Alertes sur les avis nécessitant attention</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Avertissement important */}
            <div className="mb-4 p-4 bg-linear-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-900 mb-2">
                    ⚠️ Attention : Risque de fraude sans vérification
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>
                      Sans API Google configurée, vous ne pourrez pas vérifier qu&apos;un avis a
                      réellement été publié.
                    </strong>{' '}
                    Cela signifie qu&apos;un participant pourrait gagner un lot lors de votre
                    loterie sans avoir laissé d&apos;avis Google en contrepartie.
                  </p>
                  <p className="text-gray-700 mt-3 leading-relaxed">
                    La configuration de l&apos;API vous permet de{' '}
                    <strong>confirmer automatiquement</strong> que chaque gagnant a bien publié un
                    avis avant de distribuer son gain, garantissant ainsi l&apos;équité de votre
                    loterie.
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton d'action */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setApiFormData({
                    googlePlaceId: selectedStore?.googlePlaceId || '',
                    googleApiKey: '',
                  });
                  setShowApiConfigModal(true);
                }}
                className="flex items-center gap-3 px-8 py-4 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Settings className="w-6 h-6" />
                Configurer mon API Google
              </button>
            </div>

            {/* Note informative */}
            <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-xl">
              <p className="text-sm text-gray-700 text-center">
                <strong>Comment obtenir ma clé API ?</strong> Rendez-vous sur la{' '}
                <a
                  href="https://console.cloud.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  Console Google Cloud
                </a>
                , activez l&apos;API Google My Business et créez vos credentials.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      {selectedStoreId && hasApiKey && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total avis */}
          <div className="p-6 px-10 bg-white/50 backdrop-blur-xl border flex flex-col justify-between border-purple-600/20 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total avis</p>
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div className="h-[42px] flex items-center">
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>

          {/* Note moyenne */}
          <div className="p-6 px-10 bg-white/50 backdrop-blur-xl border flex flex-col justify-between border-purple-600/20 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Note moyenne</p>
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="h-[42px] flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-800">{stats.averageRating.toFixed(1)}</p>
              <p className="text-sm text-gray-600 mb-1">/ 5</p>
            </div>
          </div>

          {/* Avis positifs */}
          <div className="p-6 px-10 bg-white/50 backdrop-blur-xl border flex flex-col justify-between border-purple-600/20 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Avis positifs (4-5★)</p>
              <span className="text-green-600 text-2xl">😊</span>
            </div>
            <div className="h-[42px] flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-800">{stats.positiveCount}</p>
              <p className="text-sm text-gray-600 mb-1">
                ({stats.total > 0 ? ((stats.positiveCount / stats.total) * 100).toFixed(0) : 0}%)
              </p>
            </div>
          </div>

          {/* Taux de réponse */}
          <div className="p-6 px-10 bg-white/50 backdrop-blur-xl border flex flex-col justify-between border-purple-600/20 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Taux de réponse</p>
              <span className="text-blue-600 text-2xl">💬</span>
            </div>
            <div className="h-[42px] flex items-center">
              <p className="text-3xl font-bold text-gray-800">{stats.responseRate.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Liste des avis */}
      {selectedStoreId && hasApiKey && (
        <div className="bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Liste des avis</h2>
          {reviewsData && reviewsData.reviews.length > 0 ? (
            <div className="space-y-4">
              {reviewsData.reviews.map((review) => (
                <div
                  key={review.reviewId}
                  className="p-4 bg-white rounded-xl border border-purple-600/10 hover:border-purple-600/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {review.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{review.authorName}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.publishedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-700 mb-3">{review.comment}</p>}
                  <div className="flex items-center gap-2 mt-3">
                    {review.hasResponse ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Répondu
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        En attente
                      </span>
                    )}
                    {review.rating <= 3 && !review.hasResponse && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        Nécessite attention
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              <Star className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Aucun avis pour le moment</p>
              <p className="text-sm mt-2">
                Cliquez sur &quot;Synchroniser&quot; pour charger les avis
              </p>
            </div>
          )}
        </div>
      )}

      {/* Message si aucun store */}
      {!storesLoading && (!stores || stores.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 bg-linear-to-br from-purple-600/20 to-pink-600/20 border border-purple-600/30 rounded-full flex items-center justify-center mb-6">
            <StoreIcon className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Aucun commerce</h3>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            Vous devez d'abord créer un commerce pour gérer ses avis Google.
          </p>
          <a
            href="/dashboard/stores?create=true"
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <StoreIcon className="w-5 h-5" />
            Créer un commerce
          </a>
        </div>
      )}

      {/* Modal: Configuration API Google */}
      {showApiConfigModal && selectedStore && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          onClick={() => setShowApiConfigModal(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl"></div>
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Configurer l&apos;API Google</h3>
                  <p className="text-sm text-gray-600 mt-1">Commerce : {selectedStore.name}</p>
                </div>
                <button
                  onClick={() => setShowApiConfigModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleApiConfigSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="apiGooglePlaceId"
                    className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                  >
                    Google Place ID
                    <button
                      type="button"
                      onClick={() => setShowPlaceIdHelp(true)}
                      className="text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </label>
                  <input
                    type="text"
                    id="apiGooglePlaceId"
                    value={apiFormData.googlePlaceId}
                    onChange={(e) =>
                      setApiFormData({ ...apiFormData, googlePlaceId: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    placeholder="Ex: ChIJ..."
                  />
                  {apiFormErrors.googlePlaceId && (
                    <p className="text-red-600 text-sm mt-1">{apiFormErrors.googlePlaceId}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    Permet de récupérer automatiquement les avis Google de votre établissement
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="apiGoogleApiKey"
                    className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                  >
                    Google API Key
                    <button
                      type="button"
                      onClick={() => setShowGoogleApiHelp(true)}
                      className="text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </label>
                  <input
                    type="password"
                    id="apiGoogleApiKey"
                    value={apiFormData.googleApiKey}
                    onChange={(e) =>
                      setApiFormData({ ...apiFormData, googleApiKey: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    placeholder="Votre clé API Google"
                  />
                  {apiFormErrors.googleApiKey && (
                    <p className="text-red-600 text-sm mt-1">{apiFormErrors.googleApiKey}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    🔒 Votre clé sera chiffrée (AES-256-GCM) avant stockage
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApiConfigModal(false)}
                    className="flex-1 px-4 py-3 bg-white/50 hover:bg-white/70 border border-purple-600/20 text-gray-700 rounded-xl font-semibold transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={updateStoreApi.isPending}
                    className="flex-1 px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {updateStoreApi.isPending ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Google Place ID Help */}
      {showPlaceIdHelp && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPlaceIdHelp(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl"></div>
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
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

      {/* Modal: Google API Key Help */}
      {showGoogleApiHelp && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          onClick={() => setShowGoogleApiHelp(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl"></div>
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
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
    </div>
  );
}
