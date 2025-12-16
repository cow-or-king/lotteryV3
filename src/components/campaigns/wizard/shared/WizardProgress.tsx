/**
 * Wizard Progress Bar Component
 * Displays the progress indicator for the campaign creation wizard
 */

'use client';

interface WizardProgressProps {
  currentStep: 1 | 2 | 3 | 4;
  totalSteps: number;
}

export default function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  return (
    <div className="px-6 py-4 bg-gray-50">
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`h-2 flex-1 rounded-full ${
              step <= currentStep ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
