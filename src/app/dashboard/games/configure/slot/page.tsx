/**
 * Slot Machine Configurator Page
 * Page de configuration visuelle de la machine à sous
 * IMPORTANT: Route protégée, ZERO any types, mobile-first responsive
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlotMachinePreview } from '@/components/games/SlotMachinePreview';
import { SlotReelsSettings } from '@/components/games/slot/SlotReelsSettings';
import {
  getDefaultSlotMachineDesign,
  SlotMachineDesignConfig,
  SlotSpinEasing,
  SlotSymbol,
} from '@/lib/types/game-design.types';
import { Save, ArrowLeft, Settings } from 'lucide-react';

export default function SlotMachineConfiguratorPage() {
  const router = useRouter();
  const [design, setDesign] = useState<SlotMachineDesignConfig>(getDefaultSlotMachineDesign());
  const [designName, setDesignName] = useState('Ma machine à sous');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveDesign = async () => {
    setIsSaving(true);
    // TODO: Implement save logic with tRPC
    setTimeout(() => {
      setIsSaving(false);
      router.push('/dashboard/games');
    }, 1000);
  };

  const handleSymbolChange = (index: number, updates: Partial<SlotSymbol>) => {
    const newSymbols = [...design.symbols];
    const symbol = newSymbols[index];
    if (symbol) {
      newSymbols[index] = { ...symbol, ...updates };
      setDesign({ ...design, symbols: newSymbols });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header - Mobile first */}
      <div className="mb-6 sm:mb-8">
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
                Créer une Machine à sous
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
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
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
        {/* Preview - Hidden on mobile, shown on tablet+ */}
        <div className="hidden lg:flex bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 items-center justify-center">
          <SlotMachinePreview design={design} interactive={true} />
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 pb-4 border-b border-gray-200">
            <Settings className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Configuration</h2>
          </div>

          {/* Settings */}
          <div className="space-y-6 overflow-y-auto max-h-[60vh] sm:max-h-[600px] pr-2">
            <SlotReelsSettings
              design={design}
              onReelsCountChange={(count) => setDesign({ ...design, reelsCount: count })}
              onBackgroundColorChange={(color) => setDesign({ ...design, backgroundColor: color })}
              onReelBorderColorChange={(color) => setDesign({ ...design, reelBorderColor: color })}
              onSpinDurationChange={(duration) => setDesign({ ...design, spinDuration: duration })}
              onSpinEasingChange={(easing: SlotSpinEasing) =>
                setDesign({ ...design, spinEasing: easing })
              }
              onReelDelayChange={(delay) => setDesign({ ...design, reelDelay: delay })}
              onSymbolChange={handleSymbolChange}
            />
          </div>
        </div>

        {/* Mobile Preview - Shown only on mobile at bottom */}
        <div className="lg:hidden bg-white rounded-xl p-6 border border-gray-200 flex items-center justify-center">
          <SlotMachinePreview design={design} interactive={true} />
        </div>
      </div>
    </div>
  );
}
