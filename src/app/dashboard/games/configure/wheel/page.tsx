/**
 * Wheel Visual Configurator Page
 * Page de configuration visuelle de la roue (SANS attribution de gains)
 * IMPORTANT: Route protégée, ZERO any types, mobile-first responsive
 */

'use client';

import { WheelPreview } from '@/components/games/WheelPreview';
import { AdvancedSettings } from '@/components/games/wheel/AdvancedSettings';
import { WheelColorSettings } from '@/components/games/wheel/WheelColorSettings';
import { WheelLogoSettings } from '@/components/games/wheel/WheelLogoSettings';
import { WheelTextSettings } from '@/components/games/wheel/WheelTextSettings';
import { useWheelDesignForm } from '@/hooks/games/useWheelDesignForm';
import { ArrowLeft, Image as ImageIcon, Palette, Save, Settings, Type } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';

type TabType = 'colors' | 'logo' | 'text' | 'advanced';

function WheelConfiguratorContent() {
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
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
              <WheelColorSettings
                design={design}
                onNumberOfSegmentsChange={handleNumberOfSegmentsChange}
                onColorModeChange={handleColorModeChange}
                onPrimaryColorChange={handlePrimaryColorChange}
                onSecondaryColorChange={handleSecondaryColorChange}
                onSegmentColorChange={handleSegmentColorChange}
              />
            )}

            {activeTab === 'logo' && (
              <WheelLogoSettings
                design={design}
                onLogoUpload={handleLogoUpload}
                onRemoveLogo={handleRemoveLogo}
                onLogoSizeChange={(size) => setDesign({ ...design, centerLogoSize: size })}
              />
            )}

            {activeTab === 'text' && (
              <WheelTextSettings
                design={design}
                onShowTextChange={(show) => setDesign({ ...design, showSegmentText: show })}
                onTextSizeChange={(size) => setDesign({ ...design, textSize: size })}
                onTextRotationChange={(rotation) =>
                  setDesign({ ...design, textRotation: rotation })
                }
              />
            )}

            {activeTab === 'advanced' && (
              <AdvancedSettings
                design={design}
                onUpdate={(updates) => setDesign({ ...design, ...updates })}
              />
            )}
          </div>
        </div>
        {/* Preview - Hidden on mobile, shown on tablet+ */}
        <div className="hidden lg:flex bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 items-center justify-center">
          <WheelPreview design={design} size={450} interactive={true} />
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

// Wrapper avec Suspense pour gérer useSearchParams
export default function WheelConfiguratorPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center h-screen px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      }
    >
      <WheelConfiguratorContent />
    </Suspense>
  );
}
