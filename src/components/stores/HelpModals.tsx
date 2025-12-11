'use client';

import { X } from 'lucide-react';

interface GoogleUrlHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoogleUrlHelpModal({ isOpen, onClose }: GoogleUrlHelpModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl"></div>
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Comment trouver mon URL Google Business ?
            </h3>
            <button
              onClick={onClose}
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
              onClick={onClose}
              className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Compris !
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlaceIdHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlaceIdHelpModal({ isOpen, onClose }: PlaceIdHelpModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl"></div>
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Comment trouver mon Google Place ID ?
            </h3>
            <button
              onClick={onClose}
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
              onClick={onClose}
              className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Compris !
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface GoogleApiHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoogleApiHelpModal({ isOpen, onClose }: GoogleApiHelpModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl"></div>
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Comment obtenir une clé API Google ?
            </h3>
            <button
              onClick={onClose}
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
              <p className="text-sm text-yellow-900 font-semibold mb-2">⚠️ Sécurité importante</p>
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
                💡 <strong>Pourquoi c&apos;est nécessaire ?</strong> L&apos;API Google vous permet
                de synchroniser automatiquement vos avis, de vérifier qu&apos;un participant a bien
                laissé un avis, et de répondre aux avis directement depuis ReviewLottery.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Compris !
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
