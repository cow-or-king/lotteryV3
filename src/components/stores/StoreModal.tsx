'use client';

import { ChevronDown, Crown, HelpCircle, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNewBrand: boolean;
  setIsNewBrand: (value: boolean) => void;
  selectedBrand: {
    brandName: string;
    logoUrl: string;
  } | null;
  formData: {
    brandName: string;
    logoUrl: string;
    name: string;
    googleBusinessUrl: string;
    googlePlaceId: string;
    googleApiKey: string;
  };
  setFormData: (data: StoreModalProps['formData']) => void;
  errors: {
    brandName?: string;
    logoUrl?: string;
    name?: string;
    googleBusinessUrl?: string;
    googlePlaceId?: string;
    googleApiKey?: string;
  };
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  limits: {
    plan: string;
    canCreateStore: boolean;
    canCreateBrand: boolean;
    maxBrands: number;
    maxStoresPerBrand: number;
    brandsCount: number;
    storesCount: number;
  } | null;
  onShowGoogleUrlHelp: () => void;
  onShowPlaceIdHelp: () => void;
  onShowGoogleApiHelp: () => void;
}

export function StoreModal({
  isOpen,
  onClose,
  isNewBrand,
  setIsNewBrand,
  selectedBrand,
  formData,
  setFormData,
  errors,
  onSubmit,
  isSubmitting,
  limits,
  onShowGoogleUrlHelp,
  onShowPlaceIdHelp,
  onShowGoogleApiHelp,
}: StoreModalProps) {
  const [showGoogleApiAccordion, setShowGoogleApiAccordion] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 rounded-3xl">
      <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isNewBrand ? 'Nouvelle enseigne' : 'Nouveau commerce'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Limites du plan FREE (mode dev: affichage informatif sans blocage) */}
        {limits && limits.plan === 'FREE' && !limits.canCreateStore && (
          <div className="mb-6 p-6 bg-linear-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <HelpCircle className="w-6 h-6 text-yellow-600" />
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
        {limits && limits.plan === 'FREE' && limits.canCreateStore && limits.brandsCount > 0 && (
          <div className="mb-6 p-5 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <HelpCircle className="w-5 h-5 text-purple-600" />
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
        <form onSubmit={onSubmit} className="space-y-5">
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
                    <p className="text-sm font-semibold text-gray-800">{selectedBrand.brandName}</p>
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
                <h3 className="text-sm font-bold text-gray-800 mb-1">Nouvelle enseigne (payant)</h3>
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
                <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-2">
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
                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
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
                {errors.logoUrl && <p className="text-red-600 text-sm mt-1">{errors.logoUrl}</p>}
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
                onClick={onShowGoogleUrlHelp}
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
                  ⚠️ <strong>Sans API :</strong> Vous pourrez lancer des loteries, mais les gains
                  seront distribués sans vérifier qu'un avis a été publié. Avec l'API, vous validez
                  que chaque gagnant a bien laissé un avis Google.
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
                      <strong>Vérification :</strong> Validez que chaque gagnant a publié un avis
                    </li>
                    <li className="list-disc">
                      <strong>Synchronisation :</strong> Importez automatiquement vos avis Google
                    </li>
                    <li className="list-disc">
                      <strong>Réponse :</strong> Répondez aux avis directement depuis ReviewLottery
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
                      onClick={onShowPlaceIdHelp}
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
                    onChange={(e) => setFormData({ ...formData, googlePlaceId: e.target.value })}
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
                      onClick={onShowGoogleApiHelp}
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
                    💡 Vous pouvez configurer cela plus tard depuis la section "Avis Google" si vous
                    voulez d'abord tester sans API.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-4">
            <p className="text-xs text-gray-600 italic text-right mb-2">* Champs obligatoires</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white/50 hover:bg-white/70 border border-purple-600/20 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
