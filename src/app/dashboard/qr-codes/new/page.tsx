/**
 * QR Code Creation Page
 * Page de création d'un QR code optimisée
 * IMPORTANT: Route protégée par le middleware
 * IMPORTANT: ZERO any types
 */

'use client';

import { QRCodeTemplateSelector } from '@/components/qr-codes';
import {
  QRCodeBasicInfoForm,
  QRCodeVisualConfigForm,
  QRCodePreviewSection,
} from '@/components/qr-codes';
import { useQRCodeCreation } from '@/hooks/qr-codes/useQRCodeCreation';
import { ArrowLeft, Save, Settings2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewQRCodePage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<'config' | 'templates'>('config');

  const {
    name,
    setName,
    nameError,
    setNameError,
    storeId,
    setStoreId,
    isUploadingLogo,
    generator,
    exporter,
    createMutation,
    handleLogoUpload,
    handleTemplateSelect,
    handleSave,
  } = useQRCodeCreation();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/qr-codes')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Créer un QR Code</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab buttons */}
          <button
            onClick={() => setCurrentTab('config')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'config'
                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                : 'bg-white/60 text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            Config
          </button>
          <button
            onClick={() => setCurrentTab('templates')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'templates'
                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                : 'bg-white/60 text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Templates
          </button>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={createMutation.isPending || !generator.url || !name.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Save className="w-4 h-4" />
            {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Configuration (2 columns width) */}
        <div className="lg:col-span-2 space-y-4">
          {currentTab === 'config' ? (
            <>
              {/* Basic Info */}
              <QRCodeBasicInfoForm
                name={name}
                onNameChange={(newName) => {
                  setName(newName);
                  setNameError('');
                }}
                nameError={nameError}
                url={generator.url}
                onUrlChange={generator.setUrl}
                urlError={generator.error}
                storeId={storeId}
                onStoreIdChange={setStoreId}
              />

              {/* Visual Config */}
              <QRCodeVisualConfigForm
                style={generator.style}
                onStyleChange={generator.setStyle}
                animation={generator.animation}
                onAnimationChange={generator.setAnimation}
                foregroundColor={generator.foregroundColor}
                backgroundColor={generator.backgroundColor}
                animationColor={generator.animationColor}
                onForegroundColorChange={generator.setForegroundColor}
                onBackgroundColorChange={generator.setBackgroundColor}
                onAnimationColorChange={generator.setAnimationColor}
                logoUrl={generator.logoUrl}
                onLogoChange={handleLogoUpload}
                logoSize={generator.logoSize || 80}
                onLogoSizeChange={generator.setLogoSize}
                isUploadingLogo={isUploadingLogo}
              />
            </>
          ) : (
            <>
              {/* Templates Section */}
              <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-lg">
                {!generator.url ? (
                  <>
                    <div className="mb-4">
                      <h2 className="text-base font-semibold text-gray-800 mb-2">
                        Templates rapides
                      </h2>
                      <p className="text-xs text-gray-600">
                        Sélectionnez un template pour pré-remplir les champs avec des configurations
                        optimisées
                      </p>
                    </div>
                    <QRCodeTemplateSelector onSelect={handleTemplateSelect} />
                  </>
                ) : (
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">Template sélectionné</h3>
                      <p className="text-xs text-gray-600">{name.split(' - ')[0]}</p>
                    </div>
                    <button
                      onClick={() => {
                        generator.setUrl('');
                        setName('');
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
                    >
                      Changer
                    </button>
                  </div>
                )}
              </div>

              {/* Show customization options if a template is selected */}
              {generator.url && (
                <>
                  <QRCodeBasicInfoForm
                    name={name}
                    onNameChange={(newName) => {
                      setName(newName);
                      setNameError('');
                    }}
                    nameError={nameError}
                    url={generator.url}
                    onUrlChange={generator.setUrl}
                    urlError={generator.error}
                    storeId={storeId}
                    onStoreIdChange={setStoreId}
                  />

                  <QRCodeVisualConfigForm
                    style={generator.style}
                    onStyleChange={generator.setStyle}
                    animation={generator.animation}
                    onAnimationChange={generator.setAnimation}
                    foregroundColor={generator.foregroundColor}
                    backgroundColor={generator.backgroundColor}
                    animationColor={generator.animationColor}
                    onForegroundColorChange={generator.setForegroundColor}
                    onBackgroundColorChange={generator.setBackgroundColor}
                    onAnimationColorChange={generator.setAnimationColor}
                    logoUrl={generator.logoUrl}
                    onLogoChange={handleLogoUpload}
                    logoSize={generator.logoSize || 80}
                    onLogoSizeChange={generator.setLogoSize}
                    isUploadingLogo={isUploadingLogo}
                  />
                </>
              )}
            </>
          )}
        </div>

        {/* Right Column: Preview */}
        <QRCodePreviewSection
          qrCodeDataUrl={generator.qrCodeResult?.dataUrl || null}
          animation={generator.animation}
          animationColor={generator.animationColor}
          isGenerating={generator.isGenerating}
          url={generator.url}
          logoUrl={generator.logoUrl}
          logoSize={generator.logoSize || 80}
          onExport={(format, size) =>
            exporter.exportAs(format, size, `${name || 'qr-code'}.${format.toLowerCase()}`)
          }
          isExporting={exporter.isExporting}
          name={name}
        />
      </div>
    </div>
  );
}
