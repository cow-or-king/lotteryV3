/**
 * Ready to play screen component
 */
import { Sparkles } from 'lucide-react';

interface ReadyToPlayStepProps {
  conditionsProgress?: {
    conditions: Array<{
      id: string;
      title: string;
      iconEmoji: string | null;
    }>;
    nextPlayableConditionId?: string | null;
  };
  onPlay: () => void;
  isPlayPending: boolean;
}

export function ReadyToPlayStep({
  conditionsProgress,
  onPlay,
  isPlayPending,
}: ReadyToPlayStepProps) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center mb-6">
        <div className="w-20 h-20 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Prêt à jouer !</h2>

      {/* Afficher quelle condition donne accès au jeu */}
      {conditionsProgress &&
        'nextPlayableConditionId' in conditionsProgress &&
        conditionsProgress.nextPlayableConditionId && (
          <>
            {(() => {
              const playableCondition = conditionsProgress.conditions.find(
                (c) =>
                  'nextPlayableConditionId' in conditionsProgress &&
                  c.id === conditionsProgress.nextPlayableConditionId,
              );
              if (playableCondition) {
                return (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 max-w-md mx-auto">
                    <p className="text-green-800 font-medium mb-2">
                      {playableCondition.iconEmoji}{' '}
                      <span className="font-bold">{playableCondition.title}</span> validée !
                    </p>
                    <p className="text-green-700 text-sm">
                      Cette condition vous donne accès au jeu de cette campagne
                    </p>
                  </div>
                );
              }
              return null;
            })()}
          </>
        )}

      <p className="text-gray-600 mb-8">Tentez votre chance et gagnez un prize à coup sûr !</p>
      <button
        className="px-8 py-4 bg-linear-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full hover:shadow-xl transform hover:scale-105 transition-all"
        onClick={onPlay}
        disabled={isPlayPending}
      >
        {isPlayPending ? 'Chargement...' : 'Lancer le jeu'}
      </button>
    </div>
  );
}
