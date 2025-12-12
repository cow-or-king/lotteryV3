'use client';

import { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  Palette,
  QrCode as QrCodeIcon,
  X,
} from 'lucide-react';
import { api } from '@/lib/trpc/client';
import type { QRCodeStyle, LogoSize, ErrorCorrectionLevel } from '@/lib/types/qr-code.types';
import QRCodeStyling from 'qr-code-styling';

interface CustomizeQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: {
    id: string;
    name: string;
    defaultQrCodeId: string | null;
    qrCodeCustomized: boolean;
    qrCodeCustomizedAt: string | null;
    logoUrl: string | null;
  };
}

const STYLES: Array<{ value: QRCodeStyle; label: string; icon: string }> = [
  { value: 'SQUARE', label: 'Carré', icon: '■' },
  { value: 'DOTS', label: 'Points', icon: '⚫' },
  { value: 'ROUNDED', label: 'Arrondi', icon: '▢' },
  { value: 'CLASSY', label: 'Élégant', icon: '✨' },
  { value: 'CIRCULAR', label: 'Circulaire', icon: '⭕' },
];

const LOGO_SIZES: Array<{ value: LogoSize; label: string; description: string }> = [
  { value: 'SMALL', label: 'Petit', description: '60px' },
  { value: 'MEDIUM', label: 'Moyen', description: '80px' },
  { value: 'LARGE', label: 'Grand', description: '120px' },
];

const ERROR_CORRECTION_LEVELS: Array<{
  value: ErrorCorrectionLevel;
  label: string;
  description: string;
}> = [
  { value: 'L', label: 'Faible (7%)', description: 'Sans logo recommandé' },
  { value: 'M', label: 'Moyen (15%)', description: 'Petits logos' },
  { value: 'Q', label: 'Élevé (25%)', description: 'Logos moyens' },
  { value: 'H', label: 'Maximum (30%)', description: 'Grands logos' },
];

export function CustomizeQRCodeModal({ isOpen, onClose, store }: CustomizeQRCodeModalProps) {
  const [style, setStyle] = useState<QRCodeStyle>('DOTS');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [logoSize, setLogoSize] = useState<LogoSize | null>(store.logoUrl ? 'MEDIUM' : null);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<ErrorCorrectionLevel>(
    store.logoUrl ? 'H' : 'M',
  );
  const [showWarning, setShowWarning] = useState(true);

  const customizeMutation = api.qrCode.customize.useMutation();
  const exportMutation = api.qrCode.export.useMutation();

  // QR Code preview
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  // Mapper les styles vers qr-code-styling
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

  // Générer le QR Code preview
  useEffect(() => {
    if (!isOpen || store.qrCodeCustomized) return;

    const targetUrl = `${window.location.origin}/s/${store.id}`;

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
        image: logoSize && store.logoUrl ? store.logoUrl : undefined,
      });
    }

    if (qrCodeRef.current) {
      qrCodeRef.current.innerHTML = '';
      qrCodeInstance.current.append(qrCodeRef.current);
    }
  }, [
    isOpen,
    style,
    foregroundColor,
    backgroundColor,
    logoSize,
    errorCorrectionLevel,
    store.logoUrl,
    store.id,
    store.qrCodeCustomized,
  ]);

  const handleCustomize = async () => {
    if (!store.defaultQrCodeId) {
      alert('QR Code par défaut non trouvé');
      return;
    }

    try {
      await customizeMutation.mutateAsync({
        qrCodeId: store.defaultQrCodeId,
        style,
        foregroundColor,
        backgroundColor,
        logoSize,
        errorCorrectionLevel,
      });

      // Refresh la page pour voir les changements
      window.location.reload();
    } catch (error) {
      console.error('Erreur personnalisation:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la personnalisation');
    }
  };

  const handleExport = async (format: 'SVG' | 'PNG') => {
    if (!store.defaultQrCodeId) {
      alert('QR Code par défaut non trouvé');
      return;
    }

    try {
      const result = await exportMutation.mutateAsync({
        qrCodeId: store.defaultQrCodeId,
        format,
      });

      // Télécharger le fichier
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = `${store.name}-QRCode.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur export:', error);
      alert(error instanceof Error ? error.message : "Erreur lors de l'export");
    }
  };

  if (!isOpen) {
    return null;
  }

  // Si déjà personnalisé : mode readonly avec export seulement
  if (store.qrCodeCustomized) {
    return (
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <QrCode className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-purple-600">QR Code Personnalisé</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">QR Code déjà personnalisé</p>
              <p className="text-xs text-green-700 mt-1">
                Personnalisé le{' '}
                {store.qrCodeCustomizedAt
                  ? new Date(store.qrCodeCustomizedAt).toLocaleDateString('fr-FR')
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleExport('SVG')}
              disabled={exportMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              Télécharger SVG (vectoriel)
            </button>

            <button
              onClick={() => handleExport('PNG')}
              disabled={exportMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              Télécharger PNG HD (2048x2048)
            </button>

            <button
              onClick={onClose}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mode personnalisation (première fois)
  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-2xl w-full shadow-2xl my-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Palette className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-purple-600">Personnaliser QR Code</h2>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Warning */}
        {showWarning && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Attention</p>
              <p className="text-xs text-orange-700 mt-1">
                Vous ne pourrez personnaliser ce QR Code qu&apos;une seule fois. Assurez-vous de
                votre choix avant de valider.
              </p>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="text-orange-600 hover:text-orange-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* QR Code Preview */}
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-white border-2 border-purple-200 rounded-2xl shadow-lg">
            <div ref={qrCodeRef} className="flex items-center justify-center" />
            <p className="text-xs text-center text-gray-500 mt-2">Prévisualisation en temps réel</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Style</label>
            <div className="grid grid-cols-5 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStyle(s.value)}
                  className={`p-3 border-2 rounded-xl text-center transition-all ${
                    style === s.value
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xs font-medium text-gray-700">{s.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Couleurs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur principale
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
                />
                <input
                  type="text"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 placeholder:text-gray-400"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur de fond
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 placeholder:text-gray-400"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>

          {/* Logo size (si logo existe) */}
          {store.logoUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Taille du logo</label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setLogoSize(null)}
                  className={`p-3 border-2 rounded-xl text-center transition-all ${
                    logoSize === null
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-xs font-medium text-gray-700">Aucun</div>
                </button>
                {LOGO_SIZES.map((ls) => (
                  <button
                    key={ls.value}
                    type="button"
                    onClick={() => setLogoSize(ls.value)}
                    className={`p-3 border-2 rounded-xl text-center transition-all ${
                      logoSize === ls.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-700">{ls.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{ls.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Correction Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Niveau de correction d&apos;erreur
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ERROR_CORRECTION_LEVELS.map((ecl) => (
                <button
                  key={ecl.value}
                  type="button"
                  onClick={() => setErrorCorrectionLevel(ecl.value)}
                  className={`p-3 border-2 rounded-xl text-left transition-all ${
                    errorCorrectionLevel === ecl.value
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">{ecl.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{ecl.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={customizeMutation.isPending}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              onClick={handleCustomize}
              disabled={customizeMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {customizeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Personnalisation...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Personnaliser définitivement
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
