/**
 * Wheel Visual Configurator Page
 * Page de configuration visuelle de la roue (SANS attribution de gains)
 * IMPORTANT: Route protégée, ZERO any types, mobile-first responsive
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WheelPreview } from '@/components/games/WheelPreview';
import { ColorModeSelector } from '@/components/games/wheel/ColorModeSelector';
import { SegmentControls } from '@/components/games/wheel/SegmentControls';
import { AdvancedSettings } from '@/components/games/wheel/AdvancedSettings';
import { useWheelDesignForm } from '@/hooks/games/useWheelDesignForm';
import { ColorModeEnum } from '@/lib/types/game-design.types';
import { Palette, Image as ImageIcon, Type, Settings, Save, ArrowLeft } from 'lucide-react';

type TabType = 'colors' | 'logo' | 'text' | 'advanced';

export default function WheelConfiguratorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('colors');

  // Hook centralisé pour toute la logique du formulaire
  const {
    design,
    setDesign,
    designName,
    setDesignName,
    designId,
    isLoading,
    isSaving,
    handleSaveDesign,
    handleColorModeChange,
    handleNumberOfSegmentsChange,
    handlePrimaryColorChange,
    handleSecondaryColorChange,
    handleSegmentColorChange,
  } = useWheelDesignForm();

  // Handlers pour le logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setDesign({ ...design, centerLogoUrl: url });
    }
  };

  const handleRemoveLogo = () => {
    setDesign({ ...design, centerLogoUrl: null });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center h-screen px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du design...</p>
        </div>
      </div>
    );
  }

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
                {designId ? 'Modifier la Roue' : 'Créer une Roue'}
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
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              {isSaving ? 'Enregistrement...' : designId ? 'Mettre à jour' : 'Enregistrer'}
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
            placeholder="Ex: Roue de Noël, Roue Promotionnelle..."
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Main Content - Mobile first grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Preview - Hidden on mobile, shown on tablet+ */}
        <div className="hidden lg:flex bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 items-center justify-center">
          <WheelPreview design={design} size={450} interactive={true} />
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
          {/* Tabs - Responsive */}
          <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
            <TabButton
              active={activeTab === 'colors'}
              onClick={() => setActiveTab('colors')}
              icon={Palette}
              label="Couleurs"
            />
            <TabButton
              active={activeTab === 'logo'}
              onClick={() => setActiveTab('logo')}
              icon={ImageIcon}
              label="Logo"
            />
            <TabButton
              active={activeTab === 'text'}
              onClick={() => setActiveTab('text')}
              icon={Type}
              label="Texte"
            />
            <TabButton
              active={activeTab === 'advanced'}
              onClick={() => setActiveTab('advanced')}
              icon={Settings}
              label="Avancé"
            />
          </div>

          {/* Tab Content - Scrollable */}
          <div className="space-y-6 overflow-y-auto max-h-[60vh] sm:max-h-[600px] pr-2">
            {activeTab === 'colors' && (
              <>
                {/* Nombre de segments */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Nombre de segments
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[4, 6, 8, 10, 12].map((count) => (
                      <button
                        key={count}
                        onClick={() => handleNumberOfSegmentsChange(count)}
                        className={`px-2 sm:px-4 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                          design.numberOfSegments === count
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode couleur */}
                <ColorModeSelector
                  colorMode={design.colorMode}
                  onColorModeChange={handleColorModeChange}
                />

                {/* Contrôles de couleur */}
                <SegmentControls
                  numberOfSegments={design.numberOfSegments}
                  colorMode={design.colorMode}
                  primaryColor={design.primaryColor}
                  secondaryColor={design.secondaryColor}
                  onNumberOfSegmentsChange={handleNumberOfSegmentsChange}
                  onPrimaryColorChange={handlePrimaryColorChange}
                  onSecondaryColorChange={handleSecondaryColorChange}
                />

                {/* Multi-color segments */}
                {design.colorMode === ColorModeEnum.MULTI_COLOR && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Couleurs des segments
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                      {design.segments.map((segment, index) => (
                        <div key={segment.id} className="text-center">
                          <input
                            type="color"
                            value={segment.color}
                            onChange={(e) => handleSegmentColorChange(index, e.target.value)}
                            className="w-full h-10 sm:h-12 rounded-lg cursor-pointer mb-1"
                          />
                          <div className="text-xs text-gray-600">S{index + 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'logo' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Logo central
                </label>

                {!design.centerLogoUrl ? (
                  <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-purple-400 transition-colors cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm sm:text-base text-gray-600 mb-2">
                      Cliquez pour uploader un logo
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, SVG - Max 2MB</p>
                  </label>
                ) : (
                  <div className="border-2 border-gray-200 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center justify-center mb-4">
                      <img
                        src={design.centerLogoUrl}
                        alt="Logo"
                        className="max-w-full max-h-32 object-contain"
                      />
                    </div>
                    <div className="flex gap-2">
                      <label className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer text-center text-sm sm:text-base">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        Changer
                      </label>
                      <button
                        onClick={handleRemoveLogo}
                        className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors text-sm sm:text-base"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}

                {/* Taille du logo */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Taille du logo: {design.centerLogoSize}px
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="120"
                    value={design.centerLogoSize}
                    onChange={(e) =>
                      setDesign({ ...design, centerLogoSize: Number(e.target.value) })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Petit</span>
                    <span>Grand</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Afficher le texte</div>
                    <div className="text-sm text-gray-500">Texte sur les segments</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={design.showSegmentText}
                      onChange={(e) => setDesign({ ...design, showSegmentText: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {design.showSegmentText && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Taille du texte: {design.textSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={design.textSize}
                        onChange={(e) => setDesign({ ...design, textSize: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Inclinaison: {design.textRotation}°
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        value={design.textRotation}
                        onChange={(e) =>
                          setDesign({ ...design, textRotation: Number(e.target.value) })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Horizontal</span>
                        <span>Vertical</span>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {activeTab === 'advanced' && (
              <AdvancedSettings
                design={design}
                onUpdate={(updates) => setDesign({ ...design, ...updates })}
              />
            )}
          </div>
        </div>

        {/* Mobile Preview - Shown only on mobile at bottom */}
        <div className="lg:hidden bg-white rounded-xl p-6 border border-gray-200 flex items-center justify-center">
          <WheelPreview design={design} size={300} interactive={true} />
        </div>
      </div>
    </div>
  );
}

// Tab Button Component - Extracted for clarity
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function TabButton({ active, onClick, icon: Icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm ${
        active
          ? 'text-purple-600 border-b-2 border-purple-600'
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.slice(0, 4)}</span>
    </button>
  );
}
