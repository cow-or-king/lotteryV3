'use client';

import { useEffect, useState } from 'react';
import {
  QRCodeListItem as QRCodeListItemType,
  QRCodeStyle,
  QRCodeAnimation,
} from '@/lib/types/qr-code.types';
import { Download, Edit, Trash2, ExternalLink, BarChart3 } from 'lucide-react';
import { generateQRCode } from '@/lib/utils/qr-code-generator';

/**
 * Props for the QRCodeListItem component
 */
interface QRCodeListItemProps {
  /** QR code data to display */
  qrCode: QRCodeListItemType;
  /** Callback fired when edit button is clicked */
  onEdit: () => void;
  /** Callback fired when delete button is clicked */
  onDelete: () => void;
  /** Callback fired when download button is clicked */
  onDownload: () => void;
  /** Callback fired when stats button is clicked */
  onStats: () => void;
}

/**
 * QRCodeListItem component for displaying QR codes in a list view
 *
 * Displays a QR code with preview, metadata, stats, and action buttons.
 * Uses glassmorphism design pattern for modern UI aesthetics.
 *
 * @component
 * @example
 * ```tsx
 * <QRCodeListItem
 *   qrCode={qrCodeData}
 *   onEdit={() => handleEdit(qrCodeData.id)}
 *   onDelete={() => handleDelete(qrCodeData.id)}
 *   onDownload={() => handleDownload(qrCodeData.id)}
 * />
 * ```
 */
export default function QRCodeListItem({
  qrCode,
  onEdit,
  onDelete,
  onDownload,
  onStats,
}: QRCodeListItemProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  // Generate QR code preview
  useEffect(() => {
    const generate = async () => {
      try {
        const result = await generateQRCode({
          url: qrCode.url,
          style: qrCode.style,
          animation: qrCode.animation,
          foregroundColor: qrCode.foregroundColor,
          backgroundColor: qrCode.backgroundColor,
          size: 256,
          errorCorrectionLevel: qrCode.errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
          logoUrl: qrCode.logoUrl,
          logoSize: qrCode.logoSize || undefined,
        });
        setQrCodeDataUrl(result.dataUrl);
      } catch (error) {
        console.error('Failed to generate QR code preview:', error);
      }
    };

    generate();
  }, [qrCode]);

  const getStyleBadgeColor = (style: QRCodeStyle): string => {
    const colors: Record<QRCodeStyle, string> = {
      DOTS: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      ROUNDED: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      SQUARE: 'bg-green-500/20 text-green-300 border-green-400/30',
      CLASSY: 'bg-pink-500/20 text-pink-300 border-pink-400/30',
      CIRCULAR: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
    };
    return colors[style] || colors.DOTS;
  };

  /**
   * Get animation badge color based on QR code animation
   */
  const getAnimationBadgeColor = (animation: QRCodeAnimation | null): string => {
    if (!animation) {
      return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }

    const colors: Record<QRCodeAnimation, string> = {
      NONE: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
      RIPPLE: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      PULSE: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
      WAVE: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      ROTATE3D: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
      GLOW: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
      CIRCULAR_RIPPLE: 'bg-pink-500/20 text-pink-300 border-pink-400/30',
    };
    return colors[animation] || colors.NONE;
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border-2 border-white/30 bg-white/60 backdrop-blur-xl transition-all duration-300 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10">
      {/* Hover gradient effect */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
      </div>

      <div className="relative p-4">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* QR Code Preview */}
          <div className="flex-shrink-0">
            <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-white/40 bg-white p-2 shadow-md">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code for ${qrCode.name}`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-500 font-medium">
                  Generating...
                </div>
              )}
            </div>
          </div>

          {/* Name and URL */}
          <div className="space-y-2 w-full">
            <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-purple-700">
              {qrCode.name}
            </h3>
            <a
              href={qrCode.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors max-w-full"
            >
              <span className="truncate">{qrCode.url}</span>
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
            </a>
          </div>

          {/* Badges and Stats */}
          <div className="flex flex-wrap gap-2 justify-center">
            <span
              className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold ${getStyleBadgeColor(qrCode.style)}`}
            >
              {qrCode.style}
            </span>
            {qrCode.animation && qrCode.animation !== 'NONE' && (
              <span
                className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold ${getAnimationBadgeColor(qrCode.animation)}`}
              >
                {qrCode.animation}
              </span>
            )}
            <span className="inline-flex items-center rounded-lg border border-gray-300/50 bg-gray-200/30 px-3 py-1.5 text-xs font-semibold text-gray-800">
              {qrCode.scanCount || 0} scans
            </span>
          </div>

          {/* Linked Store/Campaign */}
          {(qrCode.storeName || qrCode.campaignName) && (
            <div className="flex flex-wrap gap-2 justify-center text-sm">
              {qrCode.storeName && (
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/40 rounded-lg text-gray-800 font-medium">
                  📍 {qrCode.storeName}
                </span>
              )}
              {qrCode.campaignName && (
                <span className="px-3 py-1 bg-green-500/20 border border-green-400/40 rounded-lg text-gray-800 font-medium">
                  🎯 {qrCode.campaignName}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full pt-2">
            <div className="flex flex-row gap-2">
              <button
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-blue-400/40 bg-blue-500/20 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-all hover:border-blue-500/60 hover:bg-blue-500/30 hover:shadow-lg"
                aria-label="Edit QR code"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={onStats}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-purple-400/40 bg-purple-500/20 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-all hover:border-purple-500/60 hover:bg-purple-500/30 hover:shadow-lg"
                aria-label="View statistics"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Stats</span>
              </button>
            </div>
            <div className="flex flex-row gap-2">
              <button
                onClick={onDownload}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-green-400/40 bg-green-500/20 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-all hover:border-green-500/60 hover:bg-green-500/30 hover:shadow-lg"
                aria-label="Download QR code"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              <button
                onClick={onDelete}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-400/40 bg-red-500/20 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-all hover:border-red-500/60 hover:bg-red-500/30 hover:shadow-lg"
                aria-label="Delete QR code"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
