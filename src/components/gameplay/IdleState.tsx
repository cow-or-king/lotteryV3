/**
 * Composant pour les messages d'erreur et états bloquants
 * NE S'AFFICHE PAS quand le joueur peut jouer normalement
 */

interface IdleStateProps {
  variant: 'already-played' | 'error' | 'no-conditions';
  campaignName?: string;
}

export function IdleState({ variant, campaignName }: IdleStateProps) {
  // État: Déjà joué
  if (variant === 'already-played') {
    return (
      <div className="text-center py-8">
        <div className="inline-block bg-orange-50 backdrop-blur-xl border border-orange-200 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
          <span className="text-orange-600 font-bold">⏰ Participation enregistrée</span>
        </div>

        <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">Déjà joué</h2>

        <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
          Vous avez déjà participé à cette campagne. Revenez lors de la prochaine campagne !
        </p>

        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl px-8 py-6 max-w-md mx-auto shadow-lg">
          <p className="text-sm text-gray-600">
            💡 Suivez-nous sur nos réseaux sociaux pour ne pas manquer les prochaines opportunités
          </p>
        </div>
      </div>
    );
  }

  // État: Erreur (404 ou autre)
  if (variant === 'error') {
    return (
      <div className="text-center py-8">
        <div className="inline-block bg-red-50 backdrop-blur-xl border border-red-200 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
          <span className="text-red-600 font-bold">❌ Erreur</span>
        </div>

        <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">Campagne introuvable</h2>

        <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
          Cette campagne n'existe pas ou n'est plus active.
        </p>

        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl px-8 py-6 max-w-md mx-auto shadow-lg">
          <p className="text-sm text-gray-600">
            Vérifiez que le lien est correct ou contactez le commerce pour plus d'informations.
          </p>
        </div>
      </div>
    );
  }

  // État: Pas de conditions configurées
  if (variant === 'no-conditions') {
    return (
      <div className="text-center py-8">
        <div className="inline-block bg-yellow-50 backdrop-blur-xl border border-yellow-200 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
          <span className="text-yellow-600 font-bold">⚠️ Configuration incomplète</span>
        </div>

        <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
          Campagne en cours de configuration
        </h2>

        <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
          Cette campagne n'est pas encore prête. Aucune condition de participation n'a été définie.
        </p>

        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl px-8 py-6 max-w-md mx-auto shadow-lg">
          <p className="text-sm text-gray-600">
            Si vous êtes le propriétaire, veuillez configurer les conditions de participation dans
            le dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Si on arrive ici, c'est qu'il y a un problème - ne devrait jamais arriver
  return (
    <div className="text-center py-8">
      <div className="inline-block bg-gray-50 backdrop-blur-xl border border-gray-200 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
        <span className="text-gray-600 font-bold">⚠️ État inconnu</span>
      </div>

      <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
        Une erreur s'est produite
      </h2>

      <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
        Veuillez réessayer ou contacter le support.
      </p>
    </div>
  );
}
