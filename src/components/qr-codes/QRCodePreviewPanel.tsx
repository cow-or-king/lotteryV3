/**
 * QR Code Preview Panel Component
 * Preview and export section for QR code
 * IMPORTANT: ZERO any types
 */

'use client';

import { QRCodeExportOptions } from '@/components/qr-codes';
import QRCodePreview from '@/components/qr-codes/QRCodePreview';
import type { QRCodeAnimation, ExportFormat } from '@/lib/types/qr-code.types';

interface QRCodePreviewPanelProps {
  qrCodeDataUrl: string | null;
  animation: QRCodeAnimation | null;
  isGenerating: boolean;
  logoUrl: string | null;
  logoSize: number;
  onExport: (format: ExportFormat, size?: number) => void;
  isExporting: boolean;
  hasQRCode: boolean;
}

export function QRCodePreviewPanel({
  qrCodeDataUrl,
  animation,
  isGenerating,
  logoUrl,
  logoSize,
  onExport,
  isExporting,
  hasQRCode,
}: QRCodePreviewPanelProps) {
  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Aperçu</h2>
        <QRCodePreview
          key={`${logoSize}-${logoUrl}`}
          qrCodeDataUrl={qrCodeDataUrl}
          animation={animation}
          isGenerating={isGenerating}
        />
      </div>

      {/* Export Options */}
      {hasQRCode && (
        <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
          <QRCodeExportOptions onExport={onExport} isExporting={isExporting} disabled={false} />
        </div>
      )}
    </div>
  );
}
