'use client';

import {
  QRCodeListItem as QRCodeListItemType,
  QRCodeStyle,
  QRCodeAnimation,
} from '@/lib/types/qr-code.types';
import { Download, Edit, Trash2, ExternalLink } from 'lucide-react';

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
}: QRCodeListItemProps) {
  /**
   * Format date to locale string
   */
  const formatDate = (date: string | null): string => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Get style badge color based on QR code style
   */
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
    if (!animation) return 'bg-gray-500/20 text-gray-300 border-gray-400/30';

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
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/20">
      {/* Hover gradient effect */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
      </div>

      <div className="relative p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* QR Code Preview */}
          <div className="flex-shrink-0">
            <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-white/10 bg-white p-2 shadow-lg">
              {qrCode.logoUrl ? (
                <img
                  src={qrCode.logoUrl}
                  alt={`QR Code for ${qrCode.name}`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                  No Preview
                </div>
              )}
            </div>
          </div>

          {/* QR Code Details */}
          <div className="flex-1 space-y-4">
            {/* Header: Name and URL */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-semibold text-white transition-colors group-hover:text-purple-300">
                  {qrCode.name}
                </h3>
              </div>
              <a
                href={qrCode.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-400 transition-colors hover:text-blue-300"
              >
                <span className="truncate">{qrCode.url}</span>
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              </a>
            </div>

            {/* Badges: Style and Animation */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium ${getStyleBadgeColor(qrCode.style)}`}
              >
                {qrCode.style}
              </span>
              <span
                className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium ${getAnimationBadgeColor(qrCode.animation)}`}
              >
                {qrCode.animation}
              </span>
            </div>

            {/* Linked Store/Campaign */}
            {(qrCode.storeName || qrCode.campaignName) && (
              <div className="flex flex-wrap gap-3 text-sm">
                {qrCode.storeName && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">Store:</span>
                    <span className="font-medium text-white">{qrCode.storeName}</span>
                  </div>
                )}
                {qrCode.campaignName && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">Campaign:</span>
                    <span className="font-medium text-white">{qrCode.campaignName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Stats and Metadata */}
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <p className="text-gray-400">Scans</p>
                <p className="text-lg font-semibold text-white">{qrCode.scanCount || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400">Last Scanned</p>
                <p className="font-medium text-white">
                  {formatDate(qrCode.lastScannedAt ? qrCode.lastScannedAt.toString() : null)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400">Created</p>
                <p className="font-medium text-white">{formatDate(qrCode.createdAt.toString())}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-2 md:flex-col md:items-end">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:border-blue-400/50 hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20"
              aria-label="Edit QR code"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:border-green-400/50 hover:bg-green-500/20 hover:shadow-lg hover:shadow-green-500/20"
              aria-label="Download QR code"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:border-red-400/50 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/20"
              aria-label="Delete QR code"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
