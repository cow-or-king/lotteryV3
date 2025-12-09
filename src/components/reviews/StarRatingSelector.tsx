/**
 * Composant StarRatingSelector
 * Permet de sélectionner un nombre d'étoiles à afficher dans la réponse
 * IMPORTANT: ZERO any types
 */

'use client';

import { Star } from 'lucide-react';

interface StarRatingSelectorProps {
  value: number;
  onChange: (stars: number) => void;
  label?: string;
}

export function StarRatingSelector({ value, onChange, label }: StarRatingSelectorProps) {
  return (
    <div>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 rounded"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= value
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-transparent text-gray-300 hover:text-gray-400'
                }`}
              />
            </button>
          ))}
        </div>
        {value > 0 && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm font-medium text-gray-700">{value}/5</span>
            <button
              type="button"
              onClick={() => onChange(0)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>
      {value > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          {'⭐'.repeat(value)} sera ajouté au début de votre réponse
        </p>
      )}
    </div>
  );
}
