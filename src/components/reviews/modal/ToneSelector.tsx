/**
 * Composant ToneSelector
 * Sélecteur de ton pour la réponse
 * IMPORTANT: ZERO any types, Mobile-first responsive
 */

'use client';

type Tone = 'professional' | 'friendly' | 'apologetic';

interface ToneSelectorProps {
  selectedTone: Tone;
  onToneChange: (tone: Tone) => void;
}

const toneOptions = [
  { value: 'professional' as const, label: 'Professionnel', emoji: '💼' },
  { value: 'friendly' as const, label: 'Amical', emoji: '😊' },
  { value: 'apologetic' as const, label: 'Conciliant', emoji: '🙏' },
];

export function ToneSelector({ selectedTone, onToneChange }: ToneSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">Ton de la réponse</label>
      <div className="flex flex-col sm:flex-row gap-2">
        {toneOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onToneChange(option.value)}
            className={`flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl font-medium text-sm transition-all ${
              selectedTone === option.value
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-white border-2 border-purple-200 text-gray-700 hover:border-purple-400'
            }`}
          >
            <span className="mr-2">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
