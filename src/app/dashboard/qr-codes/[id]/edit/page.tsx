/**
 * QR Code Edit Page
 * Page d'édition d'un QR code
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { QRCodeEditForm } from '@/components/qr-codes/QRCodeEditForm';
import { QRCodePreviewPanel } from '@/components/qr-codes/QRCodePreviewPanel';
import { useQRCodeExport } from '@/hooks/qr-codes/useQRCodeExport';
import { useQRCodeGenerator } from '@/hooks/qr-codes/useQRCodeGenerator';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import type { QRCodeGenerationOptions } from '@/lib/types/qr-code.types';
import { ArrowLeft, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditQRCodePage() {
  const router = useRouter();
  const params = useParams();
  const qrCodeId = params.id as string;
  const { toast } = useToast();
  const [name, setName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [logoStoragePath, setLogoStoragePath] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const utils = api.useUtils();

  // QR Code Generator Hook
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

  // Delete logo mutation
  const deleteLogoMutation = api.qrCode.deleteLogo.useMutation();

  // Fetch QR code data
  const { data: qrCode, isLoading } = api.qrCode.getById.useQuery({ id: qrCodeId });

  // Initialize form with existing data
  useEffect(() => {
    if (qrCode && !isInitialized) {
      setName(qrCode.name);
      generator.setUrl(qrCode.url);
      generator.setStyle(qrCode.style);
      generator.setAnimation(qrCode.animation);
      generator.setForegroundColor(qrCode.foregroundColor);
      generator.setBackgroundColor(qrCode.backgroundColor);
      generator.setSize(qrCode.size);
      generator.setLogoUrl(qrCode.logoUrl);
      generator.setLogoSize(qrCode.logoSize || 80);
      setLogoStoragePath(qrCode.logoStoragePath);
      setStoreId(qrCode.storeId);
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCode, isInitialized]);

  // QR Code Export Hook
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

  // Auto-generate QR code when URL changes
  useEffect(() => {
    if (generator.url && isInitialized) {
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
    isInitialized,
  ]);

  // Handle logo upload
  const handleLogoUpload = async (url: string | null, file: File | null) => {
    if (file) {
      setIsUploadingLogo(true);

      // Delete old logo if it exists in storage
      if (logoStoragePath) {
        try {
          await deleteLogoMutation.mutateAsync({ storagePath: logoStoragePath });
        } catch (error) {
          // Continue even if delete fails
          console.error('Failed to delete old logo:', error);
        }
      }

      // Convert file to base64
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
      // Direct URL (not file upload)
      generator.setLogoUrl(url);
      setLogoStoragePath(null);
    } else {
      // Remove logo
      generator.setLogoUrl(null);
      setLogoStoragePath(null);
    }
  };

  // Update mutation
  const updateMutation = api.qrCode.update.useMutation({
    onSuccess: async () => {
      toast({
        title: 'QR code mis à jour',
        description: 'Le QR code a été mis à jour avec succès',
      });
      // Invalidate list query to refetch data
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
    // Validation
    if (!name.trim()) {
      setNameError('Le nom est requis');
      return;
    }
    if (!generator.url) {
      toast({
        title: 'Erreur',
        description: "L'URL est requise",
        variant: 'error',
      });
      return;
    }

    setNameError('');

    // Update QR code
    updateMutation.mutate({
      id: qrCodeId,
      name: name.trim(),
      url: generator.url,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">QR code non trouvé</h2>
        <button
          onClick={() => router.push('/dashboard/qr-codes')}
          className="text-purple-600 hover:text-purple-700 font-semibold"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Modifier le QR Code</h1>
            <p className="text-gray-600">
              Personnalisez votre QR code avec des styles et animations
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending || !generator.url}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Save className="w-5 h-5" />
          {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Configuration */}
        <QRCodeEditForm
          name={name}
          nameError={nameError}
          url={generator.url}
          urlError={generator.error || ''}
          style={generator.style}
          animation={generator.animation}
          foregroundColor={generator.foregroundColor}
          backgroundColor={generator.backgroundColor}
          animationColor={generator.animationColor || '#8b5cf6'}
          logoUrl={generator.logoUrl}
          logoSize={generator.logoSize || 80}
          storeId={storeId}
          isUploadingLogo={isUploadingLogo}
          onNameChange={(value) => {
            setName(value);
            setNameError('');
          }}
          onUrlChange={generator.setUrl}
          onStyleChange={generator.setStyle}
          onAnimationChange={generator.setAnimation}
          onForegroundColorChange={generator.setForegroundColor}
          onBackgroundColorChange={generator.setBackgroundColor}
          onAnimationColorChange={generator.setAnimationColor}
          onLogoChange={handleLogoUpload}
          onLogoSizeChange={generator.setLogoSize}
          onStoreIdChange={setStoreId}
        />

        {/* Right Column: Preview & Export */}
        <QRCodePreviewPanel
          qrCodeDataUrl={generator.qrCodeResult?.dataUrl || null}
          animation={generator.animation}
          isGenerating={generator.isGenerating}
          logoUrl={generator.logoUrl}
          logoSize={generator.logoSize || 80}
          onExport={(format, size) =>
            exporter.exportAs(format, size || 2048, `${name || 'qr-code'}.${format.toLowerCase()}`)
          }
          isExporting={exporter.isExporting}
          hasQRCode={!!generator.qrCodeResult}
        />
      </div>
    </div>
  );
}
