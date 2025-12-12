/**
 * Hook useQRCodeCreation
 * Gestion de la logique de création d'un QR code
 * IMPORTANT: ZERO any types
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQRCodeGenerator } from './useQRCodeGenerator';
import { useQRCodeExport } from './useQRCodeExport';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import type { QRCodeGenerationOptions } from '@/lib/types/qr-code.types';

export function useQRCodeCreation() {
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useUtils();

  // État local
  const [name, setName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [logoStoragePath, setLogoStoragePath] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  const [storeId, setStoreId] = useState<string | null>(null);

  // Hook QR code generation
  const generator = useQRCodeGenerator();

  // Options pour génération QR
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

  // Hook export
  const exporter = useQRCodeExport(generator.qrCodeResult?.dataUrl || null, qrCodeOptions);

  // Génération automatique du QR
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

  // Mutation upload logo
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

  // Mutation création QR code
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

  // Handler upload logo
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

  // Handler template selection
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

  // Handler save
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

  return {
    // État
    name,
    setName,
    nameError,
    setNameError,
    storeId,
    setStoreId,
    isUploadingLogo,

    // Generator
    generator,
    qrCodeOptions,
    exporter,

    // Mutations
    createMutation,

    // Handlers
    handleLogoUpload,
    handleTemplateSelect,
    handleSave,
  };
}
