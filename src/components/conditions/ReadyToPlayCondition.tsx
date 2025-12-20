/**
 * Ready To Play Condition Component
 * Affiche l'écran final quand toutes les conditions sont complétées
 * IMPORTANT: ZERO any types
 */

'use client';

import { Sparkles, CheckCircle2 } from 'lucide-react';

interface ReadyToPlayConditionProps {
  userName: string;
  onPlay: () => void;
  totalConditions: number;
}

export function ReadyToPlayCondition({
  userName,
  onPlay,
  totalConditions,
}: ReadyToPlayConditionProps) {
  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progression</span>
          <span className="text-sm font-medium text-green-600">
            {totalConditions}/{totalConditions} Complétées
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="text-center space-y-6">
        {/* Success icon */}
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Success message */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Bravo {userName} ! 🎉</h2>
          <p className="text-lg text-gray-600">Vous avez complété toutes les conditions</p>
        </div>

        {/* Completed conditions summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">
              {totalConditions}{' '}
              {totalConditions > 1 ? 'conditions complétées' : 'condition complétée'}
            </span>
          </div>
        </div>

        {/* Call to action */}
        <div className="space-y-4 pt-4">
          <p className="text-gray-700 font-medium">
            Vous êtes maintenant prêt à jouer et tenter de gagner un prix !
          </p>

          <button
            onClick={onPlay}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6" />
              Jouer maintenant
              <Sparkles className="w-6 h-6" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
