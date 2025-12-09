/**
 * Google API Accordion Component
 * Section repliable pour la configuration de l'API Google (optionnel)
 */

'use client';

import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface GoogleApiAccordionProps {
  googlePlaceId: string;
  googleApiKey: string;
  errors: {
    googlePlaceId?: string;
    googleApiKey?: string;
  };
  onChange: (field: 'googlePlaceId' | 'googleApiKey', value: string) => void;
  onShowPlaceIdHelp: () => void;
  onShowApiKeyHelp: () => void;
}

export function GoogleApiAccordion({
  googlePlaceId,
  googleApiKey,
  errors,
  onChange,
  onShowPlaceIdHelp,
  onShowApiKeyHelp,
}: GoogleApiAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-purple-600/20 rounded-2xl overflow-hidden">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
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
              {isOpen ? 'Cliquez pour fermer' : 'Cliquez pour configurer'}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-purple-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Warning when CLOSED */}
      {!isOpen && (
        <div className="p-4 bg-yellow-50 border-t border-yellow-200">
          <p className="text-sm text-gray-700">
            ⚠️ <strong>Sans API :</strong> Vous pourrez lancer des loteries, mais les gains seront
            distribués sans vérifier qu'un avis a été publié. Avec l'API, vous validez que chaque
            gagnant a bien laissé un avis Google.
          </p>
        </div>
      )}

      {/* Accordion Content when OPEN */}
      {isOpen && (
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
                <strong>IA (bientôt) :</strong> Réponses automatiques et analyses intelligentes
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
              value={googlePlaceId}
              onChange={(e) => onChange('googlePlaceId', e.target.value)}
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
              className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              Google API Key
              <button
                type="button"
                onClick={onShowApiKeyHelp}
                className="text-purple-600 hover:text-purple-700 transition-colors"
                title="Comment obtenir une clé API ?"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </label>
            <input
              type="password"
              id="googleApiKey"
              value={googleApiKey}
              onChange={(e) => onChange('googleApiKey', e.target.value)}
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
  );
}
