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
      {label && <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>}

      {/* Stars Selection */}
      <div className="flex items-center gap-3 mb-3">
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
                    : 'fill-gray-200 text-gray-300 hover:fill-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {value > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{value}/5</span>
          </div>
        )}
      </div>

      {/* Checkbox for empty stars */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="empty-stars"
          checked={value === -1}
          onChange={(e) => onChange(e.target.checked ? -1 : 0)}
          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
        />
        <label htmlFor="empty-stars" className="text-sm text-gray-600 cursor-pointer">
          Afficher 5 étoiles vides (☆☆☆☆☆)
        </label>
      </div>

      {/* Preview */}
      {value > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          {'⭐'.repeat(value)}
          {'☆'.repeat(5 - value)} sera ajouté au début de votre réponse
        </p>
      )}
      {value === -1 && (
        <p className="text-xs text-gray-500 mt-2">☆☆☆☆☆ sera ajouté au début de votre réponse</p>
      )}
    </div>
  );
}
