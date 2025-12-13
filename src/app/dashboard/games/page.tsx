/**
 * Games Library Page
 * Bibliothèque de jeux interactifs avec templates
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameTypeEnum } from '@/lib/types/game.types';
import { TemplateSelectionModal } from '@/components/games/TemplateSelectionModal';
import { Sparkles, Dices, Grid3x3, Box, Shuffle, Target, Trophy, Zap } from 'lucide-react';
import { api } from '@/lib/trpc/client';

interface GameTemplate {
  type: keyof typeof GameTypeEnum;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  features: string[];
  popular?: boolean;
  comingSoon?: boolean;
}

const gameTemplates: GameTemplate[] = [
  {
    type: 'WHEEL',
    name: 'Roue de la Fortune',
    description: 'Roue interactive avec segments personnalisables et animations fluides',
    icon: Target,
    color: 'from-purple-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
    features: ['Segments personnalisables', 'Animations fluides', 'Son & vibrations'],
    popular: true,
  },
  {
    type: 'SCRATCH',
    name: 'Carte à Gratter',
    description: 'Grattez pour découvrir votre gain avec effet réaliste',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
    features: [
      'Effet de grattage réaliste',
      'Zone de grattage personnalisable',
      'Révélation progressive',
    ],
  },
  {
    type: 'SLOT_MACHINE',
    name: 'Machine à Sous',
    description: 'Alignez les symboles pour gagner des récompenses',
    icon: Grid3x3,
    color: 'from-orange-500 to-red-500',
    gradient: 'bg-gradient-to-br from-orange-500/10 to-red-500/10',
    features: ['Rouleaux animés', 'Symboles personnalisés', 'Combinaisons gagnantes'],
    popular: true,
  },
  {
    type: 'MYSTERY_BOX',
    name: 'Boîte Mystère',
    description: 'Choisissez une boîte parmi plusieurs pour découvrir votre surprise',
    icon: Box,
    color: 'from-green-500 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
    features: ['Choix multiple', "Animation d'ouverture", 'Suspense garanti'],
  },
  {
    type: 'DICE',
    name: 'Lancer de Dés',
    description: 'Lancez les dés et tentez votre chance',
    icon: Dices,
    color: 'from-yellow-500 to-amber-500',
    gradient: 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10',
    features: ['Physique réaliste', 'Multiple dés', 'Règles personnalisables'],
  },
  {
    type: 'SHAKE',
    name: 'Secouer pour Gagner',
    description: 'Secouez votre téléphone pour révéler votre gain',
    icon: Zap,
    color: 'from-indigo-500 to-purple-500',
    gradient: 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10',
    features: ['Détection de mouvement', 'Feedback haptique', 'Mobile-first'],
    comingSoon: true,
  },
  {
    type: 'MEMORY',
    name: 'Jeu de Mémoire',
    description: 'Trouvez les paires pour gagner des récompenses',
    icon: Shuffle,
    color: 'from-rose-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-rose-500/10 to-pink-500/10',
    features: ['Cartes personnalisables', 'Niveaux de difficulté', 'Chronomètre'],
    comingSoon: true,
  },
  {
    type: 'WHEEL_MINI',
    name: 'Roue Rapide',
    description: 'Version simplifiée et ultra-rapide de la roue',
    icon: Trophy,
    color: 'from-teal-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-teal-500/10 to-cyan-500/10',
    features: ['Rotation rapide', 'Interface minimaliste', 'Parfait pour mobile'],
    comingSoon: true,
  },
];

export default function GamesLibraryPage() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<GameTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Récupérer les designs personnalisés depuis la DB
  const { data: customDesigns = [] } = api.wheelDesign.list.useQuery();

  const handleSelectGame = (template: GameTemplate) => {
    if (template.comingSoon) return;

    // Redirection directe vers le configurateur selon le type de jeu
    if (template.type === 'WHEEL') {
      router.push('/dashboard/games/configure/wheel');
    } else {
      // Pour les autres jeux, on garde la modal pour le moment
      setSelectedGame(template);
      setShowTemplateModal(true);
    }
  };

  const handleSelectTemplate = (templateKey: string) => {
    if (!selectedGame) return;
    router.push(`/dashboard/games/new?type=${selectedGame.type}&template=${templateKey}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Bibliothèque de Jeux</h1>
        <p className="text-lg text-gray-600">
          Choisissez un jeu et personnalisez-le selon vos besoins
        </p>
      </div>

      {/* Mes Designs Personnalisés */}
      {customDesigns.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Mes Designs Personnalisés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {customDesigns.map((design) => (
              <button
                key={design.id}
                onClick={() => router.push(`/dashboard/games/configure/wheel?id=${design.id}`)}
                className="relative group p-6 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-400 hover:shadow-xl hover:scale-105 cursor-pointer transition-all duration-300"
              >
                {/* Badge personnalisé */}
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  Mon design
                </div>

                {/* Icône */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>

                {/* Contenu */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">{design.name}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {design.numberOfSegments} segments •{' '}
                  {design.colorMode === 'BI_COLOR' ? 'Bi-color' : 'Multicolor'}
                </p>

                {/* CTA */}
                <div className="mt-6 pt-4 border-t border-purple-200">
                  <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Modifier →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Game Templates Grid */}
      <div className={customDesigns.length > 0 ? 'mb-12' : ''}>
        {customDesigns.length > 0 && (
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Templates Disponibles</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {gameTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.type}
                onClick={() => handleSelectGame(template)}
                disabled={template.comingSoon}
                className={`
                relative group
                p-6 rounded-2xl border-2 border-gray-200
                transition-all duration-300
                ${template.gradient}
                ${
                  template.comingSoon
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:border-gray-300 hover:shadow-xl hover:scale-105 cursor-pointer'
                }
              `}
              >
                {/* Popular Badge */}
                {template.popular && !template.comingSoon && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Populaire
                  </div>
                )}

                {/* Coming Soon Badge */}
                {template.comingSoon && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Bientôt
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`
                w-16 h-16 rounded-xl bg-gradient-to-br ${template.color}
                flex items-center justify-center mb-4
                group-hover:scale-110 transition-transform duration-300
              `}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>

                {/* Features */}
                <ul className="space-y-2">
                  {template.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                      <div
                        className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${template.color}`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {!template.comingSoon && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <span
                      className={`text-sm font-semibold bg-gradient-to-r ${template.color} bg-clip-text text-transparent`}
                    >
                      Personnaliser →
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Choisissez un jeu</h3>
              <p className="text-sm text-gray-600">
                Sélectionnez le type de jeu qui correspond le mieux à votre campagne
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Personnalisez</h3>
              <p className="text-sm text-gray-600">
                Ajustez les couleurs, textes, gains et paramètres selon vos besoins
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Publiez</h3>
              <p className="text-sm text-gray-600">
                Activez votre jeu et partagez-le avec vos clients via QR code ou lien
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Template Selection Modal */}
      {selectedGame && (
        <TemplateSelectionModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          gameType={selectedGame.type}
          gameName={selectedGame.name}
          onSelectTemplate={handleSelectTemplate}
        />
      )}
    </div>
  );
}
