/**
 * Composant pour l'état IDLE du gameplay
 */

import { Sparkles } from 'lucide-react';

interface IdleStateProps {
  onPlay: () => void;
}

export function IdleState({ onPlay }: IdleStateProps) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-linear-to-br from-purple-500 to-pink-500 mb-6 animate-pulse">
        <Sparkles className="h-16 w-16 text-white" />
      </div>
      <h2 className="text-4xl font-bold text-gray-900 mb-4">Prêt à tenter votre chance ?</h2>
      <p className="text-gray-600 mb-8 text-lg">
        Cliquez sur le bouton pour découvrir si vous avez gagné un lot !
      </p>
      <button
        onClick={onPlay}
        className="bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold py-5 px-12 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg text-xl"
      >
        JOUER MAINTENANT
      </button>
    </div>
  );
}
