/**
 * Wheel Mini Configurator Page
 * Page de configuration visuelle de la roue mini (simplifiée)
 * IMPORTANT: Route protégée, ZERO any types, mobile-first responsive
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WheelMiniPreview } from '@/components/games/WheelMiniPreview';
import {
  getDefaultWheelMiniDesign,
  WheelMiniDesignConfig,
  WheelMiniStyle,
} from '@/lib/types/game-design.types';
import { Save, ArrowLeft, Zap } from 'lucide-react';

export default function WheelMiniConfiguratorPage() {
  const router = useRouter();
  const [design, setDesign] = useState<WheelMiniDesignConfig>(getDefaultWheelMiniDesign());
  const [designName, setDesignName] = useState('Ma roue rapide');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveDesign = async () => {
    setIsSaving(true);
    // TODO: Implement save logic with tRPC
    setTimeout(() => {
      setIsSaving(false);
      router.push('/dashboard/games');
    }, 1000);
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
                Créer une Roue Rapide
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Version simplifiée et rapide</p>
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
            placeholder="Ex: Roue Express, Roue Turbo..."
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Main Content - Mobile first grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Preview - Hidden on mobile, shown on tablet+ */}
        <div className="hidden lg:flex bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 items-center justify-center">
          <WheelMiniPreview design={design} size={400} interactive={true} />
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 pb-4 border-b border-gray-200">
            <Zap className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Configuration simplifiée</h2>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            {/* Nombre de segments */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Nombre de segments
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([4, 6, 8] as const).map((count) => (
                  <button
                    key={count}
                    onClick={() => setDesign({ ...design, segments: count })}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      design.segments === count
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Couleurs */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Couleurs alternées
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Couleur 1</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={design.colors[0] || '#8B5CF6'}
                      onChange={(e) => {
                        const newColors = [...design.colors];
                        newColors[0] = e.target.value;
                        setDesign({ ...design, colors: newColors });
                      }}
                      className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
                    />
                    <span className="text-sm text-gray-700 font-mono">
                      {design.colors[0] || '#8B5CF6'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Couleur 2</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={design.colors[1] || '#EC4899'}
                      onChange={(e) => {
                        const newColors = [...design.colors];
                        newColors[1] = e.target.value;
                        setDesign({ ...design, colors: newColors });
                      }}
                      className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
                    />
                    <span className="text-sm text-gray-700 font-mono">
                      {design.colors[1] || '#EC4899'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Style</label>
              <div className="grid grid-cols-2 gap-2">
                {(['FLAT', 'GRADIENT'] as WheelMiniStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => setDesign({ ...design, style })}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      design.style === style
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {style === 'FLAT' ? 'Plat' : 'Dégradé'}
                  </button>
                ))}
              </div>
            </div>

            {/* Durée de rotation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Durée de rotation: {design.spinDuration}ms
              </label>
              <input
                type="range"
                min="1000"
                max="4000"
                step="100"
                value={design.spinDuration}
                onChange={(e) => setDesign({ ...design, spinDuration: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Ultra rapide</span>
                <span>Normal</span>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">Roue Rapide</h4>
                  <p className="text-sm text-purple-700">
                    Version simplifiée de la roue classique avec moins d&apos;options mais plus
                    rapide à configurer. Idéale pour des jeux simples et dynamiques.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Preview - Shown only on mobile at bottom */}
        <div className="lg:hidden bg-white rounded-xl p-6 border border-gray-200 flex items-center justify-center">
          <WheelMiniPreview design={design} size={300} interactive={true} />
        </div>
      </div>
    </div>
  );
}
