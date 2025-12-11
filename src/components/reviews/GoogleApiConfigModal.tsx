/**
 * Modal de configuration Google API
 */

'use client';

import { X, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface Store {
  id: string;
  name: string;
  googlePlaceId?: string;
}

interface GoogleApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  formData: {
    googlePlaceId: string;
    googleApiKey: string;
  };
  formErrors: {
    googlePlaceId?: string;
    googleApiKey?: string;
  };
  onFormDataChange: (data: { googlePlaceId: string; googleApiKey: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function GoogleApiConfigModal({
  isOpen,
  onClose,
  store,
  formData,
  formErrors,
  onFormDataChange,
  onSubmit,
  isSubmitting,
}: GoogleApiConfigModalProps) {
  const [showPlaceIdHelp, setShowPlaceIdHelp] = useState(false);
  const [showGoogleApiHelp, setShowGoogleApiHelp] = useState(false);

  if (!isOpen || !store) {
    return null;
  }

  return (
    <>
      {/* Modal principale de configuration */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl"></div>
        <div
          className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 overflow-y-auto flex-1">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Configurer l&apos;API Google</h3>
                <p className="text-sm text-gray-600 mt-1">Commerce : {store.name}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
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
                  value={formData.googlePlaceId}
                  onChange={(e) => onFormDataChange({ ...formData, googlePlaceId: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="Ex: ChIJ..."
                />
                {formErrors.googlePlaceId && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.googlePlaceId}</p>
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
                  value={formData.googleApiKey}
                  onChange={(e) => onFormDataChange({ ...formData, googleApiKey: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="Votre clé API Google"
                />
                {formErrors.googleApiKey && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.googleApiKey}</p>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  🔒 Votre clé sera chiffrée (AES-256-GCM) avant stockage
                </p>
              </div>

              <div className="flex gap-3 pt-4">
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
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

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
                      Recherchez et activez <strong>&quot;Google My Business API&quot;</strong>
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
    </>
  );
}
