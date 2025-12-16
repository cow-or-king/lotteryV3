/**
 * Step 3: Game Selection
 * Choose between game templates or custom games
 */

'use client';

import { Gamepad2 } from 'lucide-react';

interface GameTemplate {
  id: string;
  name: string;
  description: string;
  previewImage?: string | null;
  minPrizes: number;
  maxPrizes: number;
}

interface CustomGame {
  id: string;
  name: string;
  type: string;
  primaryColor: string | null;
  secondaryColor: string | null;
}

interface Step3GameSelectionProps {
  templates: GameTemplate[] | undefined;
  customGames: CustomGame[] | undefined;
  selectedTemplateId: string | null;
  selectedGameId: string | null;
  gameSelectionMode: 'template' | 'custom';
  onTemplateSelect: (templateId: string) => void;
  onGameSelect: (gameId: string) => void;
  onModeChange: (mode: 'template' | 'custom') => void;
  isLoadingGames: boolean;
}

export default function Step3GameSelection({
  templates,
  customGames,
  selectedTemplateId,
  selectedGameId,
  gameSelectionMode,
  onTemplateSelect,
  onGameSelect,
  onModeChange,
  isLoadingGames,
}: Step3GameSelectionProps) {
  const handleModeChange = (mode: 'template' | 'custom') => {
    onModeChange(mode);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Gamepad2 className="h-12 w-12 text-purple-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Type de jeu</h3>
        <p className="text-sm text-gray-500 mt-1">
          Choisissez un template ou utilisez un jeu personnalisé
        </p>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleModeChange('template')}
          className={`p-4 rounded-lg border-2 transition-all ${
            gameSelectionMode === 'template'
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🎨</div>
            <div className="font-semibold text-gray-900">Templates</div>
            <div className="text-xs text-gray-500 mt-1">Jeux par défaut</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('custom')}
          className={`p-4 rounded-lg border-2 transition-all ${
            gameSelectionMode === 'custom'
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">✨</div>
            <div className="font-semibold text-gray-900">Mes jeux</div>
            <div className="text-xs text-gray-500 mt-1">Jeux personnalisés</div>
          </div>
        </button>
      </div>

      {/* Template Selection */}
      {gameSelectionMode === 'template' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates?.map((template) => (
            <div
              key={template.id}
              onClick={() => onTemplateSelect(template.id)}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                selectedTemplateId === template.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-center">
                {template.previewImage ? (
                  <img
                    src={template.previewImage}
                    alt={template.name}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                ) : (
                  <div className="w-full h-32 bg-linear-to-br from-purple-100 to-pink-100 rounded-md mb-3 flex items-center justify-center">
                    <Gamepad2 className="h-12 w-12 text-purple-400" />
                  </div>
                )}
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{template.name}</h4>
                <p className="text-xs text-gray-500">{template.description}</p>
                <div className="mt-2 text-xs text-purple-600 font-medium">
                  {template.minPrizes}-{template.maxPrizes} lots
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Games Selection */}
      {gameSelectionMode === 'custom' && (
        <div>
          {isLoadingGames ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
              <p className="text-sm text-gray-500 mt-2">Chargement de vos jeux...</p>
            </div>
          ) : customGames && customGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customGames.map((game) => (
                <div
                  key={game.id}
                  onClick={() => onGameSelect(game.id)}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    selectedGameId === game.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-center">
                    <div
                      className="w-full h-32 rounded-md mb-3 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${game.primaryColor || '#8B5CF6'}, ${game.secondaryColor || '#EC4899'})`,
                      }}
                    >
                      <Gamepad2 className="h-12 w-12 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{game.name}</h4>
                    <div className="text-xs text-gray-500">{game.type}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Gamepad2 className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-2">Aucun jeu personnalisé</p>
              <p className="text-xs text-gray-500">
                Créez d'abord un jeu ou utilisez les templates
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
