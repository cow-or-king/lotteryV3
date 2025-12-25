/**
 * Journey complete screen component - displayed after all conditions completed
 */
interface JourneyCompleteStepProps {
  conditionsProgress: {
    conditions: Array<{
      id: string;
      title: string;
      iconEmoji: string | null;
    }>;
    completedConditions: string[] | null;
    participant: {
      playCount: number;
    } | null;
  };
}

export function JourneyCompleteStep({ conditionsProgress }: JourneyCompleteStepProps) {
  const playCount = conditionsProgress.participant?.playCount || 0;
  const completedCount = conditionsProgress.completedConditions?.length || 0;
  const totalConditions = conditionsProgress.conditions?.length || 0;
  const allCompleted = completedCount >= totalConditions && playCount >= totalConditions;

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center mb-6">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl ${
            allCompleted
              ? 'bg-linear-to-br from-green-400 to-emerald-600 animate-pulse'
              : 'bg-linear-to-br from-purple-400 to-pink-600'
          }`}
        >
          <span className="text-6xl">{allCompleted ? '🎉' : '⏸️'}</span>
        </div>
      </div>

      {allCompleted ? (
        <>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Parcours terminé !</h2>
          <p className="text-gray-600 mb-6">
            Vous avez complété toutes les étapes de cette campagne et joué à tous les jeux
            disponibles.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">À bientôt !</h2>
          <p className="text-gray-600 mb-6">
            Vous avez joué pour cette étape. Revenez plus tard pour compléter la prochaine condition
            et rejouer !
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <p className="text-blue-800 font-medium">
              📊 Progression: {completedCount}/{totalConditions} conditions complétées
            </p>
            <p className="text-blue-600 text-sm mt-2">
              🎮 {playCount} jeu{playCount > 1 ? 'x' : ''} joué{playCount > 1 ? 's' : ''}
            </p>
          </div>
        </>
      )}

      {conditionsProgress.conditions.length > 0 && (
        <div className="bg-linear-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Conditions :</p>
          <div className="space-y-2">
            {conditionsProgress.conditions.map((condition) => {
              const isCompleted =
                conditionsProgress.participant &&
                Array.isArray(conditionsProgress.completedConditions) &&
                conditionsProgress.completedConditions.includes(condition.id);
              return (
                <div key={condition.id} className="flex items-center gap-2 text-gray-700">
                  <span className={isCompleted ? 'text-green-500' : 'text-gray-300'}>
                    {isCompleted ? '✓' : '○'}
                  </span>
                  <span className={`text-sm ${isCompleted ? '' : 'text-gray-400'}`}>
                    {condition.iconEmoji} {condition.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-gray-500 text-sm">
        {allCompleted
          ? 'Merci pour votre participation ! Revenez bientôt pour de nouvelles campagnes.'
          : 'Scannez à nouveau le QR code lors de votre prochaine visite pour continuer !'}
      </p>
    </div>
  );
}
