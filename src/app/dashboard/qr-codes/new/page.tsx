/**
 * QR Code Creation Page
 * Page de création d'un QR code optimisée
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { useQRCodeGenerator } from '@/hooks/qr-codes/useQRCodeGenerator';
import { useQRCodeExport } from '@/hooks/qr-codes/useQRCodeExport';
import {
  QRCodeStyleSelector,
  QRCodeAnimationSelector,
  QRCodeColorPicker,
  QRCodeLogoUpload,
  QRCodeExportOptions,
  QRCodeStoreSelector,
  QRCodeTemplateSelector,
} from '@/components/qr-codes';
import QRCodePreview from '@/components/qr-codes/QRCodePreview';
import { ArrowLeft, Save, Sparkles, Settings2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { QRCodeGenerationOptions } from '@/lib/types/qr-code.types';

export default function NewQRCodePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState<'config' | 'templates'>('config');
  const [name, setName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [logoStoragePath, setLogoStoragePath] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const utils = api.useUtils();

  const generator = useQRCodeGenerator();

  const uploadLogoMutation = api.qrCode.uploadLogo.useMutation({
    onSuccess: (data) => {
      generator.setLogoUrl(data.url);
      setLogoStoragePath(data.storagePath);
      setIsUploadingLogo(false);
      toast({
        title: 'Logo uploadé',
        description: 'Le logo a été uploadé avec succès',
      });
    },
    onError: (error: { message: string }) => {
      setIsUploadingLogo(false);
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error',
      });
    },
  });

  const qrCodeOptions: QRCodeGenerationOptions = {
    url: generator.url,
    style: generator.style,
    animation: generator.animation,
    foregroundColor: generator.foregroundColor,
    backgroundColor: generator.backgroundColor,
    size: generator.size,
    errorCorrectionLevel: 'M',
    logoUrl: generator.logoUrl,
    logoSize: generator.logoSize,
  };

  const exporter = useQRCodeExport(generator.qrCodeResult?.dataUrl || null, qrCodeOptions);

  useEffect(() => {
    if (generator.url) {
      generator.generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    generator.url,
    generator.style,
    generator.animation,
    generator.foregroundColor,
    generator.backgroundColor,
    generator.size,
    generator.logoUrl,
    generator.logoSize,
  ]);

  const handleTemplateSelect = (template: {
    name: string;
    urlPlaceholder: string;
    style: typeof generator.style;
    animation: typeof generator.animation;
    foregroundColor: string;
    backgroundColor: string;
    namePrefix: string;
  }) => {
    setName(`${template.namePrefix} - ${new Date().toLocaleDateString('fr-FR')}`);
    generator.setUrl(template.urlPlaceholder);
    generator.setStyle(template.style);
    generator.setAnimation(template.animation);
    generator.setForegroundColor(template.foregroundColor);
    generator.setBackgroundColor(template.backgroundColor);
  };

  const handleLogoUpload = async (url: string | null, file: File | null) => {
    if (file) {
      setIsUploadingLogo(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        uploadLogoMutation.mutate({
          fileName: file.name,
          contentType: file.type,
          fileData: base64String,
        });
      };
      reader.readAsDataURL(file);
    } else if (url) {
      generator.setLogoUrl(url);
      setLogoStoragePath(null);
    } else {
      generator.setLogoUrl(null);
      setLogoStoragePath(null);
    }
  };

  const createMutation = api.qrCode.create.useMutation({
    onSuccess: async () => {
      toast({
        title: 'QR code créé',
        description: 'Le QR code a été créé avec succès',
      });
      await utils.qrCode.list.invalidate();
      router.push('/dashboard/qr-codes');
    },
    onError: (error: { message: string }) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error',
      });
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Le nom est requis');
      toast({
        title: 'Erreur',
        description: 'Le nom du QR code est requis',
        variant: 'error',
      });
      return;
    }
    if (!generator.url) {
      toast({
        title: 'Erreur',
        description: "L'URL de destination est requise",
        variant: 'error',
      });
      return;
    }

    setNameError('');

    createMutation.mutate({
      name: name.trim(),
      url: generator.url,
      type: 'STATIC',
      style: generator.style,
      animation: generator.animation,
      foregroundColor: generator.foregroundColor,
      backgroundColor: generator.backgroundColor,
      size: generator.size,
      errorCorrectionLevel: 'M',
      logoUrl: generator.logoUrl,
      logoSize: generator.logoSize,
      logoStoragePath,
      storeId: storeId || undefined,
    });
  };

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
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
              {/* Basic Info Card */}
              <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-lg">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Informations de base</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Store */}
                  <div>
                    <QRCodeStoreSelector value={storeId} onChange={setStoreId} />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom du QR Code *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setNameError('');
                      }}
                      placeholder="Ex: QR Code Restaurant"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
                    />
                    {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                  </div>
                </div>

                {/* URL */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL de destination *
                  </label>
                  <input
                    type="url"
                    value={generator.url}
                    onChange={(e) => generator.setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
                  />
                  {generator.error && (
                    <p className="text-red-500 text-xs mt-1">{generator.error}</p>
                  )}
                </div>
              </div>

              {/* Visual Config Card */}
              <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-lg">
                <h2 className="text-base font-semibold text-gray-800 mb-4">
                  Personnalisation visuelle
                </h2>

                {/* Style */}
                <div className="mb-4">
                  <QRCodeStyleSelector value={generator.style} onChange={generator.setStyle} />
                </div>

                {/* Animation */}
                <div className="mb-4">
                  <QRCodeAnimationSelector
                    value={generator.animation}
                    onChange={generator.setAnimation}
                  />
                </div>

                {/* Colors */}
                <div className="mb-4">
                  <QRCodeColorPicker
                    foregroundColor={generator.foregroundColor}
                    backgroundColor={generator.backgroundColor}
                    animationColor={generator.animationColor}
                    onForegroundChange={generator.setForegroundColor}
                    onBackgroundChange={generator.setBackgroundColor}
                    onAnimationColorChange={generator.setAnimationColor}
                  />
                </div>

                {/* Logo */}
                <div>
                  <QRCodeLogoUpload
                    logoUrl={generator.logoUrl}
                    onLogoChange={handleLogoUpload}
                    logoSize={generator.logoSize || 80}
                    onLogoSizeChange={generator.setLogoSize}
                  />
                  {isUploadingLogo && (
                    <div className="mt-2 text-xs text-purple-600 font-medium">
                      Upload en cours...
                    </div>
                  )}
                </div>
              </div>
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

              {/* Show customization options if a template is selected (URL is filled) */}
              {generator.url && (
                <>
                  {/* Basic Info Card */}
                  <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-lg">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">
                      Informations de base
                    </h2>

                    {/* Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom du QR Code *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setNameError('');
                        }}
                        placeholder="Ex: QR Code Restaurant"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
                      />
                      {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                    </div>

                    {/* URL */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        URL de destination *
                      </label>
                      <input
                        type="url"
                        value={generator.url}
                        onChange={(e) => generator.setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
                      />
                      {generator.error && (
                        <p className="text-red-500 text-xs mt-1">{generator.error}</p>
                      )}
                    </div>
                  </div>

                  {/* Visual Config Card */}
                  <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-lg">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">
                      Personnalisation visuelle
                    </h2>

                    {/* Style */}
                    <div className="mb-4">
                      <QRCodeStyleSelector value={generator.style} onChange={generator.setStyle} />
                    </div>

                    {/* Animation */}
                    <div className="mb-4">
                      <QRCodeAnimationSelector
                        value={generator.animation}
                        onChange={generator.setAnimation}
                      />
                    </div>

                    {/* Colors */}
                    <div className="mb-4">
                      <QRCodeColorPicker
                        foregroundColor={generator.foregroundColor}
                        backgroundColor={generator.backgroundColor}
                        animationColor={generator.animationColor}
                        onForegroundChange={generator.setForegroundColor}
                        onBackgroundChange={generator.setBackgroundColor}
                        onAnimationColorChange={generator.setAnimationColor}
                      />
                    </div>

                    {/* Logo */}
                    <div>
                      <QRCodeLogoUpload
                        logoUrl={generator.logoUrl}
                        onLogoChange={handleLogoUpload}
                        logoSize={generator.logoSize || 80}
                        onLogoSizeChange={generator.setLogoSize}
                      />
                      {isUploadingLogo && (
                        <div className="mt-2 text-xs text-purple-600 font-medium">
                          Upload en cours...
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* Preview */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-4 shadow-lg">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Aperçu</h2>
            <div className="w-full aspect-square">
              <QRCodePreview
                key={`${generator.logoSize}-${generator.logoUrl}`}
                qrCodeDataUrl={generator.qrCodeResult?.dataUrl || null}
                animation={generator.animation}
                animationColor={generator.animationColor}
                isGenerating={generator.isGenerating}
              />
            </div>
            {!generator.url && (
              <div className="mt-3 text-center text-xs text-gray-500">
                Entrez une URL pour voir l'aperçu
              </div>
            )}
          </div>

          {/* Export Options */}
          {generator.qrCodeResult && (
            <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-4 shadow-lg">
              <QRCodeExportOptions
                onExport={(format, size) =>
                  exporter.exportAs(format, size, `${name || 'qr-code'}.${format}`)
                }
                isExporting={exporter.isExporting}
                disabled={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
