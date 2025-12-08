/**
 * Message informatif lorsque l'API Google n'est pas configurée
 */

'use client';

import { AlertCircle, Settings, Sparkles, Zap } from 'lucide-react';

interface NoApiConfigMessageProps {
  onConfigureClick: () => void;
}

export function NoApiConfigMessage({ onConfigureClick }: NoApiConfigMessageProps) {
  return (
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
            Pour synchroniser et gérer vos avis Google, vous devez configurer votre clé API Google
            My Business.
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
                Cela signifie qu&apos;un participant pourrait gagner un lot lors de votre loterie
                sans avoir laissé d&apos;avis Google en contrepartie.
              </p>
              <p className="text-gray-700 mt-3 leading-relaxed">
                La configuration de l&apos;API vous permet de{' '}
                <strong>confirmer automatiquement</strong> que chaque gagnant a bien publié un avis
                avant de distribuer son gain, garantissant ainsi l&apos;équité de votre loterie.
              </p>
            </div>
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="flex justify-center">
          <button
            onClick={onConfigureClick}
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
  );
}
