'use client';

import { CheckCircle2, Crown, X } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limits: {
    maxBrands: number;
    maxStoresPerBrand: number;
  } | null;
}

export function UpgradeModal({ isOpen, onClose, limits }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl"></div>
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Limite du plan gratuit atteinte</h3>
            <button
              onClick={onClose}
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
              onClick={onClose}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Continuer avec le plan gratuit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
