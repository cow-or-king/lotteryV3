/**
 * Games Library Page
 * Bibliothèque de jeux interactifs avec templates
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TemplateSelectionModal } from '@/components/games/TemplateSelectionModal';
import { GameCard } from '@/components/games/GameCard';
import { GameTemplateGrid, gameTemplates } from '@/components/games/GameTemplateGrid';
import { useGamesList } from '@/hooks/games/useGamesList';
import { useGameActions } from '@/hooks/games/useGameActions';
import type { GameType } from '@/lib/types/game.types';

interface GameTemplate {
  type: GameType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  features: string[];
  popular?: boolean;
  comingSoon?: boolean;
}

export default function GamesLibraryPage() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<GameTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const { customDesigns, slotMachineGames, wheelMiniGames, hasCustomContent } = useGamesList();
  const { handleDeleteWheel, handleDeleteGame } = useGameActions();

  const handleSelectGame = (template: GameTemplate) => {
    if (template.comingSoon) {
      return;
    }

    switch (template.type) {
      case 'WHEEL':
        router.push('/dashboard/games/configure/wheel');
        break;
      case 'SCRATCH':
        router.push('/dashboard/games/configure/scratch');
        break;
      case 'SLOT_MACHINE':
        router.push('/dashboard/games/configure/slot');
        break;
      case 'WHEEL_MINI':
        router.push('/dashboard/games/configure/wheel-mini');
        break;
      default:
        setSelectedGame(template);
        setShowTemplateModal(true);
    }
  };

  const handleSelectTemplate = (templateKey: string) => {
    if (!selectedGame) {
      return;
    }
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
      {hasCustomContent && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Mes Designs Personnalisés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Wheel Designs */}
            {customDesigns.map((design) => (
              <GameCard
                key={`wheel-${design.id}`}
                id={design.id}
                name={design.name}
                type="WHEEL"
                description={`Roue • ${design.numberOfSegments} segments • ${
                  design.colorMode === 'BI_COLOR' ? 'Bi-color' : 'Multicolor'
                }`}
                badgeText="Mon design"
                borderColor="border-purple-200"
                gradientFrom="from-purple-50"
                gradientTo="to-pink-50"
                buttonColor="bg-purple-100"
                buttonHoverColor="hover:bg-purple-200"
                textColor="text-purple-700"
                borderTopColor="border-purple-200"
                onEdit={(id) => router.push(`/dashboard/games/configure/wheel?id=${id}`)}
                onDelete={handleDeleteWheel}
              />
            ))}

            {/* Slot Machine Games */}
            {slotMachineGames.map((game) => (
              <GameCard
                key={`slot-${game.id}`}
                id={game.id}
                name={game.name}
                type="SLOT_MACHINE"
                description={`Machine à sous • ${game._count?.plays || 0} parties jouées`}
                badgeText="Mon design"
                borderColor="border-orange-200"
                gradientFrom="from-orange-50"
                gradientTo="to-red-50"
                buttonColor="bg-orange-100"
                buttonHoverColor="hover:bg-orange-200"
                textColor="text-orange-700"
                borderTopColor="border-orange-200"
                onEdit={(id) => router.push(`/dashboard/games/configure/slot?id=${id}`)}
                onDelete={handleDeleteGame}
              />
            ))}

            {/* Wheel Mini Games */}
            {wheelMiniGames.map((game) => (
              <GameCard
                key={`wheel-mini-${game.id}`}
                id={game.id}
                name={game.name}
                type="WHEEL_MINI"
                description={`Roue rapide • ${game._count?.plays || 0} parties jouées`}
                badgeText="Mon design"
                borderColor="border-teal-200"
                gradientFrom="from-teal-50"
                gradientTo="to-cyan-50"
                buttonColor="bg-teal-100"
                buttonHoverColor="hover:bg-teal-200"
                textColor="text-teal-700"
                borderTopColor="border-teal-200"
                onEdit={(id) => router.push(`/dashboard/games/configure/wheel-mini?id=${id}`)}
                onDelete={handleDeleteGame}
              />
            ))}
          </div>
        </div>
      )}

      {/* Game Templates Grid */}
      <div className={hasCustomContent ? 'mb-12' : ''}>
        {hasCustomContent && (
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Templates Disponibles</h2>
        )}
        <GameTemplateGrid templates={gameTemplates} onSelectTemplate={handleSelectGame} />
      </div>

      {/* Info Section */}
      <div className="mt-16 bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
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
            <div className="flex-shrink-0 w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
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
            <div className="flex-shrink-0 w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
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
