/**
 * Google Business URL Field Component
 * Champ pour l'URL Google Business Profile
 */

'use client';

import { HelpCircle } from 'lucide-react';

interface GoogleBusinessUrlFieldProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onShowHelp: () => void;
}

export function GoogleBusinessUrlField({
  value,
  error,
  onChange,
  onShowHelp,
}: GoogleBusinessUrlFieldProps) {
  return (
    <div>
      <label
        htmlFor="googleBusinessUrl"
        className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
      >
        URL Google Business Profile *
        <button
          type="button"
          onClick={onShowHelp}
          className="text-purple-600 hover:text-purple-700 transition-colors"
          title="Comment trouver mon URL ?"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </label>
      <input
        type="url"
        id="googleBusinessUrl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
        placeholder="Ex: https://g.page/r/ABC123.../review"
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      <p className="text-xs text-gray-600 mt-1">
        URL de votre page Google Business (pour laisser un avis)
      </p>
    </div>
  );
}
