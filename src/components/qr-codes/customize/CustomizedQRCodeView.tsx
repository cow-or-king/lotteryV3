import { CheckCircle2, Download, Loader2, QrCode, X } from 'lucide-react';

interface CustomizedQRCodeViewProps {
  storeName: string;
  customizedAt: string | null;
  isExporting: boolean;
  onExport: (format: 'SVG' | 'PNG') => void;
  onClose: () => void;
}

export function CustomizedQRCodeView({
  storeName: _storeName,
  customizedAt,
  isExporting,
  onExport,
  onClose,
}: CustomizedQRCodeViewProps) {
  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <QrCode className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-purple-600">QR Code Personnalis�</h2>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">QR Code d�j� personnalis�</p>
            <p className="text-xs text-green-700 mt-1">
              Personnalis� le{' '}
              {customizedAt ? new Date(customizedAt).toLocaleDateString('fr-FR') : 'N/A'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onExport('SVG')}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            T�l�charger SVG (vectoriel)
          </button>

          <button
            onClick={() => onExport('PNG')}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            T�l�charger PNG HD (2048x2048)
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
