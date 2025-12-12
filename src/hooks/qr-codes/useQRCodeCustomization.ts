import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import QRCodeStyling from 'qr-code-styling';
import { api } from '@/lib/trpc/client';
import type { QRCodeStyle, LogoSize, ErrorCorrectionLevel } from '@/lib/types/qr-code.types';

interface UseQRCodeCustomizationProps {
  storeId: string;
  logoUrl: string | null;
  defaultQrCodeId: string | null;
  qrCodeCustomized: boolean;
}

export function useQRCodeCustomization({
  storeId,
  logoUrl,
  defaultQrCodeId,
  qrCodeCustomized,
}: UseQRCodeCustomizationProps) {
  const [style, setStyle] = useState<QRCodeStyle>('DOTS');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [logoSize, setLogoSize] = useState<LogoSize | null>(logoUrl ? 'MEDIUM' : null);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<ErrorCorrectionLevel>(
    logoUrl ? 'H' : 'M',
  );
  const [showWarning, setShowWarning] = useState(true);

  const customizeMutation = api.qrCode.customize.useMutation();
  const exportMutation = api.qrCode.export.useMutation();

  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  const getDotsOptions = (styleValue: QRCodeStyle) => {
    switch (styleValue) {
      case 'SQUARE':
        return { type: 'square' as const };
      case 'DOTS':
        return { type: 'dots' as const };
      case 'ROUNDED':
        return { type: 'rounded' as const };
      case 'CLASSY':
        return { type: 'classy' as const };
      case 'CIRCULAR':
        return { type: 'extra-rounded' as const };
      default:
        return { type: 'dots' as const };
    }
  };

  useEffect(() => {
    if (qrCodeCustomized) {
      return;
    }

    const targetUrl = `${window.location.origin}/s/${storeId}`;

    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling({
        width: 300,
        height: 300,
        data: targetUrl,
        margin: 10,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: errorCorrectionLevel,
        },
        dotsOptions: {
          color: foregroundColor,
          ...getDotsOptions(style),
        },
        backgroundOptions: {
          color: backgroundColor,
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 10,
        },
      });
    } else {
      qrCodeInstance.current.update({
        data: targetUrl,
        qrOptions: {
          errorCorrectionLevel: errorCorrectionLevel,
        },
        dotsOptions: {
          color: foregroundColor,
          ...getDotsOptions(style),
        },
        backgroundOptions: {
          color: backgroundColor,
        },
        image: logoSize && logoUrl ? logoUrl : undefined,
      });
    }

    if (qrCodeRef.current) {
      qrCodeRef.current.innerHTML = '';
      qrCodeInstance.current.append(qrCodeRef.current);
    }
  }, [
    style,
    foregroundColor,
    backgroundColor,
    logoSize,
    errorCorrectionLevel,
    logoUrl,
    storeId,
    qrCodeCustomized,
  ]);

  const handleCustomize = async () => {
    if (!defaultQrCodeId) {
      toast.error('QR Code par défaut non trouvé');
      return;
    }

    try {
      await customizeMutation.mutateAsync({
        qrCodeId: defaultQrCodeId,
        style,
        foregroundColor,
        backgroundColor,
        logoSize,
        errorCorrectionLevel,
      });

      window.location.reload();
    } catch (error) {
      console.error('Erreur personnalisation:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la personnalisation');
    }
  };

  const handleExport = async (format: 'SVG' | 'PNG', storeName: string) => {
    if (!defaultQrCodeId) {
      toast.error('QR Code par défaut non trouvé');
      return;
    }

    try {
      const result = await exportMutation.mutateAsync({
        qrCodeId: defaultQrCodeId,
        format,
      });

      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = `${storeName}-QRCode.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'export");
    }
  };

  return {
    style,
    setStyle,
    foregroundColor,
    setForegroundColor,
    backgroundColor,
    setBackgroundColor,
    logoSize,
    setLogoSize,
    errorCorrectionLevel,
    setErrorCorrectionLevel,
    showWarning,
    setShowWarning,
    qrCodeRef,
    handleCustomize,
    handleExport,
    isCustomizing: customizeMutation.isPending,
    isExporting: exportMutation.isPending,
  };
}
