'use client';

import { AlertTriangle, CheckCircle2, Loader2, Palette, X } from 'lucide-react';
import { useQRCodeCustomization } from '@/hooks/qr-codes/useQRCodeCustomization';
import { QRCodePreview } from './customize/QRCodePreview';
import { QRCodeStyleSelector } from './customize/QRCodeStyleSelector';
import { QRCodeColorPickers } from './customize/QRCodeColorPickers';
import { QRCodeLogoSizeSelector } from './customize/QRCodeLogoSizeSelector';
import { QRCodeErrorCorrectionSelector } from './customize/QRCodeErrorCorrectionSelector';
import { CustomizedQRCodeView } from './customize/CustomizedQRCodeView';

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

export function CustomizeQRCodeModal({ isOpen, onClose, store }: CustomizeQRCodeModalProps) {
  const {
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
    isCustomizing,
    isExporting,
  } = useQRCodeCustomization({
    storeId: store.id,
    logoUrl: store.logoUrl,
    defaultQrCodeId: store.defaultQrCodeId,
    qrCodeCustomized: store.qrCodeCustomized,
  });

  if (!isOpen) {
    return null;
  }

  if (store.qrCodeCustomized) {
    return (
      <CustomizedQRCodeView
        storeName={store.name}
        customizedAt={store.qrCodeCustomizedAt}
        isExporting={isExporting}
        onExport={(format) => handleExport(format, store.name)}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-4 sm:p-6 md:p-8 max-w-full sm:max-w-2xl w-full shadow-2xl my-4 sm:my-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Palette className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-purple-600">Personnaliser QR Code</h2>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

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

        <QRCodePreview qrCodeRef={qrCodeRef} />

        <div className="space-y-6">
          <QRCodeStyleSelector selectedStyle={style} onStyleChange={setStyle} />

          <QRCodeColorPickers
            foregroundColor={foregroundColor}
            backgroundColor={backgroundColor}
            onForegroundColorChange={setForegroundColor}
            onBackgroundColorChange={setBackgroundColor}
          />

          <QRCodeLogoSizeSelector
            selectedSize={logoSize}
            onSizeChange={setLogoSize}
            hasLogo={!!store.logoUrl}
          />

          <QRCodeErrorCorrectionSelector
            selectedLevel={errorCorrectionLevel}
            onLevelChange={setErrorCorrectionLevel}
          />

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isCustomizing}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              onClick={handleCustomize}
              disabled={isCustomizing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCustomizing ? (
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
