/**
 * Campaign Landing Page
 * Page d'atterrissage quand un utilisateur scanne un QR code ou clique sur un lien
 * Route: /c/[campaignId] (simplifié pour test, le shortCode viendra plus tard)
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { Gift, Play, Info } from 'lucide-react';

export default function CampaignLandingPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.shortCode as string; // Pour le test, on utilise directement l'ID

  // Récupérer la campagne
  const { data: campaign, isLoading } = api.campaign.getById.useQuery(
    { id: campaignId },
    { enabled: !!campaignId },
  );

  const handlePlayClick = () => {
    router.push(`/play/login?campaignId=${campaignId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
          <p className="mt-4 text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
        <div className="text-center text-white max-w-md mx-4">
          <h1 className="text-3xl font-bold mb-4">Campagne introuvable</h1>
          <p className="text-gray-300">Cette campagne n'existe pas ou n'est plus active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center">
          <Gift className="h-16 w-16 text-white mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">{campaign.name}</h1>
          {campaign.description && <p className="text-purple-100">{campaign.description}</p>}
        </div>

        {/* Contenu */}
        <div className="p-8">
          {/* Informations de la campagne */}
          <div className="bg-purple-50 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Comment ça marche ?</h3>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Connectez-vous avec Google</li>
                  <li>Jouez pour tenter de gagner un lot</li>
                  <li>Si vous gagnez, récupérez votre lot en magasin</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Stats de la campagne */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {campaign._count?.prizes || 0}
              </div>
              <div className="text-sm text-gray-600">Lots disponibles</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">
                {campaign._count?.participants || 0}
              </div>
              <div className="text-sm text-gray-600">Participants</div>
            </div>
          </div>

          {/* Bouton pour jouer */}
          <button
            onClick={handlePlayClick}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            <Play className="h-6 w-6" />
            Jouer maintenant
          </button>
        </div>
      </div>
    </div>
  );
}
