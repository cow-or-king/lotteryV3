/**
 * QRCodePreviewSection
 * Section de prévisualisation et export du QR code
 * IMPORTANT: ZERO any types
 */

import QRCodePreview from '@/components/qr-codes/QRCodePreview';
import { QRCodeExportOptions } from '@/components/qr-codes';
import type { QRCodeAnimation } from '@/lib/types/qr-code.types';

interface QRCodePreviewSectionProps {
  qrCodeDataUrl: string | null;
  animation: QRCodeAnimation | null;
  animationColor: string | null;
  isGenerating: boolean;
  url: string;
  logoUrl: string | null;
  logoSize: number;
  onExport: (format: 'PNG' | 'SVG' | 'PDF', size: number) => void;
  isExporting: boolean;
  name: string;
}

export function QRCodePreviewSection({
  qrCodeDataUrl,
  animation,
  animationColor,
  isGenerating,
  url,
  logoUrl,
  logoSize,
  onExport,
  isExporting,
}: QRCodePreviewSectionProps) {
  return (
    <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      {/* Preview */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-4 shadow-lg">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Aperçu</h2>
        <div className="w-full aspect-square">
          <QRCodePreview
            key={`${logoSize}-${logoUrl}`}
            qrCodeDataUrl={qrCodeDataUrl}
            animation={animation}
            animationColor={animationColor || undefined}
            isGenerating={isGenerating}
          />
        </div>
        {!url && (
          <div className="mt-3 text-center text-xs text-gray-500">
            Entrez une URL pour voir l'aperçu
          </div>
        )}
      </div>

      {/* Export Options */}
      {qrCodeDataUrl && (
        <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-4 shadow-lg">
          <QRCodeExportOptions
            onExport={(format, size) => onExport(format, size)}
            isExporting={isExporting}
            disabled={false}
          />
        </div>
      )}
    </div>
  );
}
