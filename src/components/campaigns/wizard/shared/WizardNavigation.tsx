/**
 * Wizard Navigation Component
 * Handles navigation buttons (Previous/Next/Create) for the campaign wizard
 */

'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';

interface WizardNavigationProps {
  currentStep: 1 | 2 | 3 | 4;
  canProceed: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCreate: () => void;
  isCreating: boolean;
}

export default function WizardNavigation({
  currentStep,
  canProceed,
  onPrevious,
  onNext,
  onCreate,
  isCreating,
}: WizardNavigationProps) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
      <button
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="h-4 w-4" />
        Précédent
      </button>

      {currentStep < 4 ? (
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={onCreate}
          disabled={!canProceed || isCreating}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Création...' : 'Créer la campagne'}
        </button>
      )}
    </div>
  );
}
