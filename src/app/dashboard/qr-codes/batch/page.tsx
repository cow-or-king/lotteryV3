/**
 * QR Code Batch Creation Page
 * Page de création de QR codes en batch
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { useQRCodeGenerator } from '@/hooks/qr-codes/useQRCodeGenerator';
import {
  QRCodeStyleSelector,
  QRCodeAnimationSelector,
  QRCodeColorPicker,
  QRCodeLogoUpload,
  QRCodeStoreSelector,
} from '@/components/qr-codes';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { useState } from 'react';

type BatchQRCode = {
  id: string;
  name: string;
  url: string;
};

export default function BatchQRCodePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [qrCodes, setQrCodes] = useState<BatchQRCode[]>([
    { id: crypto.randomUUID(), name: '', url: '' },
  ]);
  const [logoStoragePath, setLogoStoragePath] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const utils = api.useUtils();

  // QR Code Generator Hook (for common configuration)
  const generator = useQRCodeGenerator();

  // Upload logo mutation
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

  // Handle logo upload
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

  // Create batch mutation
  const createBatchMutation = api.qrCode.createBatch.useMutation({
    onSuccess: async (data) => {
      toast({
        title: 'QR codes créés',
        description: `${data.count} QR codes ont été créés avec succès`,
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

  const addQRCode = () => {
    if (qrCodes.length >= 50) {
      toast({
        title: 'Limite atteinte',
        description: 'Vous ne pouvez créer que 50 QR codes à la fois maximum',
        variant: 'error',
      });
      return;
    }
    setQrCodes([...qrCodes, { id: crypto.randomUUID(), name: '', url: '' }]);
  };

  const removeQRCode = (id: string) => {
    if (qrCodes.length === 1) {
      toast({
        title: 'Erreur',
        description: 'Vous devez avoir au moins un QR code',
        variant: 'error',
      });
      return;
    }
    setQrCodes(qrCodes.filter((qr) => qr.id !== id));
  };

  const updateQRCode = (id: string, field: 'name' | 'url', value: string) => {
    setQrCodes(qrCodes.map((qr) => (qr.id === id ? { ...qr, [field]: value } : qr)));
  };

  const handleSave = () => {
    // Validation
    const emptyFields = qrCodes.filter((qr) => !qr.name.trim() || !qr.url.trim());
    if (emptyFields.length > 0) {
      toast({
        title: 'Erreur',
        description: 'Tous les QR codes doivent avoir un nom et une URL',
        variant: 'error',
      });
      return;
    }

    // Validate URLs
    const invalidUrls = qrCodes.filter((qr) => {
      try {
        new URL(qr.url);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      toast({
        title: 'Erreur',
        description: 'Certaines URLs sont invalides',
        variant: 'error',
      });
      return;
    }

    // Save QR codes
    createBatchMutation.mutate({
      qrCodes: qrCodes.map((qr) => ({
        name: qr.name.trim(),
        url: qr.url.trim(),
      })),
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/qr-codes')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Créer des QR Codes en Batch</h1>
            <p className="text-gray-600">
              Créez plusieurs QR codes à la fois avec une configuration commune
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={createBatchMutation.isPending || qrCodes.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Save className="w-5 h-5" />
          {createBatchMutation.isPending
            ? 'Enregistrement...'
            : `Enregistrer ${qrCodes.length} QR codes`}
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: QR Codes List */}
        <div className="space-y-6">
          {/* QR Codes List */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                QR Codes ({qrCodes.length}/50)
              </h2>
              <button
                onClick={addQRCode}
                disabled={qrCodes.length >= 50}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {qrCodes.map((qr, index) => (
                <div
                  key={qr.id}
                  className="border border-gray-200 rounded-xl p-4 bg-white/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      QR Code #{index + 1}
                    </span>
                    <button
                      onClick={() => removeQRCode(qr.id)}
                      disabled={qrCodes.length === 1}
                      className="text-red-600 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                    <input
                      type="text"
                      value={qr.name}
                      onChange={(e) => updateQRCode(qr.id, 'name', e.target.value)}
                      placeholder={`QR Code ${index + 1}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                    <input
                      type="url"
                      value={qr.url}
                      onChange={(e) => updateQRCode(qr.id, 'url', e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Common Configuration */}
        <div className="space-y-6">
          {/* Style Selector */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuration commune</h2>
            <QRCodeStyleSelector value={generator.style} onChange={generator.setStyle} />
          </div>

          {/* Animation Selector */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
            <QRCodeAnimationSelector
              value={generator.animation}
              onChange={generator.setAnimation}
            />
          </div>

          {/* Color Pickers */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
            <QRCodeColorPicker
              foregroundColor={generator.foregroundColor}
              backgroundColor={generator.backgroundColor}
              animationColor={generator.animationColor}
              onForegroundChange={generator.setForegroundColor}
              onBackgroundChange={generator.setBackgroundColor}
              onAnimationColorChange={generator.setAnimationColor}
            />
          </div>

          {/* Logo Upload */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
            <QRCodeLogoUpload
              logoUrl={generator.logoUrl}
              onLogoChange={handleLogoUpload}
              logoSize={generator.logoSize || 80}
              onLogoSizeChange={generator.setLogoSize}
            />
            {isUploadingLogo && (
              <div className="mt-2 text-sm text-purple-600 font-medium">Upload en cours...</div>
            )}
          </div>

          {/* Store Selector */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
            <QRCodeStoreSelector value={storeId} onChange={setStoreId} />
          </div>
        </div>
      </div>
    </div>
  );
}
