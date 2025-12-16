/**
 * Slot Machine Configurator Page
 * Page de configuration visuelle de la machine à sous
 * IMPORTANT: Route protégée, ZERO any types, mobile-first responsive
 */

'use client';

import { useRouter } from 'next/navigation';
import { SlotMachinePreview } from '@/components/games/SlotMachinePreview';
import { SlotReelsSettings } from '@/components/games/slot/SlotReelsSettings';
import { SlotWinPatternsSettings } from '@/components/games/slot/SlotWinPatternsSettings';
import { SlotSpinEasing } from '@/lib/types/game';
import { Save, ArrowLeft, Settings, Award } from 'lucide-react';
import { useSlotMachineDesignForm } from '@/hooks/games/useSlotMachineDesignForm';

export default function SlotMachineConfiguratorPage() {
  const router = useRouter();

  // Hook centralisé pour toute la logique du formulaire
  const {
    design,
    setDesign,
    designName,
    setDesignName,
    gameId,
    isLoading,
    isSaving,
    handleSaveDesign,
    handleSymbolChange,
    handleAddPattern,
    handleUpdatePattern,
    handleDeletePattern,
  } = useSlotMachineDesignForm();

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center h-screen px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du design...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header - Mobile first */}
      <div className="mb-6 sm:mb-8 relative z-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                {gameId ? 'Modifier la Machine à sous' : 'Créer une Machine à sous'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Configurez l&apos;apparence visuelle
              </p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => router.push('/dashboard/games')}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm sm:text-base"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveDesign}
              disabled={isSaving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              {isSaving ? 'Enregistrement...' : gameId ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </div>

        {/* Nom du design */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du design</label>
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            placeholder="Ex: Machine Classique, Machine Deluxe..."
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Main Content - Mobile first grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Configuration Panel */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 relative z-10">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 pb-4 border-b border-gray-200">
            <Settings className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Configuration</h2>
          </div>

          {/* Settings */}
          <div className="space-y-6 overflow-y-auto max-h-[60vh] lg:max-h-[calc(100vh-300px)] pr-2">
            {/* Reels Settings */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-gray-600" />
                <h3 className="text-md font-semibold text-gray-700">Rouleaux & Symboles</h3>
              </div>
              <SlotReelsSettings
                design={design}
                onReelsCountChange={(count) => setDesign({ ...design, reelsCount: count })}
                onBackgroundColorChange={(color) =>
                  setDesign({ ...design, backgroundColor: color })
                }
                onReelBorderColorChange={(color) =>
                  setDesign({ ...design, reelBorderColor: color })
                }
                onSpinDurationChange={(duration) =>
                  setDesign({ ...design, spinDuration: duration })
                }
                onSpinEasingChange={(easing: SlotSpinEasing) =>
                  setDesign({ ...design, spinEasing: easing })
                }
                onReelDelayChange={(delay) => setDesign({ ...design, reelDelay: delay })}
                onSymbolChange={handleSymbolChange}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Win Patterns Settings */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-gray-600" />
                <h3 className="text-md font-semibold text-gray-700">Patterns de Gain</h3>
              </div>
              <SlotWinPatternsSettings
                design={design}
                onAddPattern={handleAddPattern}
                onUpdatePattern={handleUpdatePattern}
                onDeletePattern={handleDeletePattern}
              />
            </div>
          </div>
        </div>

        {/* Preview - Shown on desktop on right, on mobile at bottom */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto pointer-events-auto">
            <SlotMachinePreview design={design} interactive={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
