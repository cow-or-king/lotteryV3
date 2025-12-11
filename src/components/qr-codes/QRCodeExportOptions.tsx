'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { ExportFormat, QR_CODE_SIZES } from '@/lib/types/qr-code.types';

/**
 * Props for the QRCodeExportOptions component
 */
interface QRCodeExportOptionsProps {
  /** Callback function when export is triggered */
  onExport: (format: ExportFormat, size: number) => void;
  /** Whether an export operation is in progress */
  isExporting: boolean;
  /** Whether the export options should be disabled */
  disabled: boolean;
}

/**
 * QRCodeExportOptions Component
 *
 * Provides options for exporting QR codes in different formats and sizes.
 * Features format selection (PNG, SVG, PDF), size selection, and export button.
 *
 * @param props - Component props
 * @returns QR code export options interface
 */
export default function QRCodeExportOptions({
  onExport,
  isExporting,
  disabled,
}: QRCodeExportOptionsProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(ExportFormat.PNG);
  const [selectedSize, setSelectedSize] = useState<number>(512);

  /**
   * Handles the export button click
   */
  const handleExport = () => {
    if (!disabled && !isExporting) {
      onExport(selectedFormat, selectedSize);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-800">Exporter le QR Code</h3>

      {/* Export Format Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">Export Format</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSelectedFormat(ExportFormat.PNG)}
            disabled={disabled}
            className={`
              flex-1 px-4 py-3 rounded-xl font-medium transition-all
              ${
                selectedFormat === ExportFormat.PNG
                  ? 'bg-purple-500/20 border-2 border-purple-400/50 text-gray-900 shadow-lg'
                  : 'bg-white/20 border border-gray-300/40 text-gray-800 hover:bg-white/30 hover:border-gray-400/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            PNG
          </button>
          <button
            type="button"
            onClick={() => setSelectedFormat(ExportFormat.SVG)}
            disabled={disabled}
            className={`
              flex-1 px-4 py-3 rounded-xl font-medium transition-all
              ${
                selectedFormat === ExportFormat.SVG
                  ? 'bg-purple-500/20 border-2 border-purple-400/50 text-gray-900 shadow-lg'
                  : 'bg-white/20 border border-gray-300/40 text-gray-800 hover:bg-white/30 hover:border-gray-400/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            SVG
          </button>
          <button
            type="button"
            disabled
            className="
              relative flex-1 px-4 py-3 rounded-xl font-medium
              bg-white/10 border border-gray-300/30 text-gray-500 cursor-not-allowed
            "
          >
            PDF
            <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
              Coming soon
            </span>
          </button>
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <label htmlFor="size-select" className="block text-sm font-semibold text-gray-800 mb-3">
          Export Size
        </label>
        <select
          id="size-select"
          value={selectedSize}
          onChange={(e) => setSelectedSize(Number(e.target.value))}
          disabled={disabled}
          className="
            w-full px-4 py-3 rounded-xl
            bg-white/20 border border-gray-300
            text-gray-900 font-medium
            focus:outline-none focus:ring-2 focus:ring-purple-500
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
          "
        >
          {QR_CODE_SIZES.map((size) => (
            <option key={size} value={size} className="bg-white text-gray-900">
              {size} x {size}px
            </option>
          ))}
        </select>
      </div>

      {/* Export Button */}
      <button
        type="button"
        onClick={handleExport}
        disabled={disabled || isExporting}
        className="
          w-full px-6 py-3 rounded-xl font-semibold
          bg-gradient-to-r from-purple-500 to-pink-500
          text-white shadow-lg
          hover:shadow-xl hover:scale-[1.02]
          active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          transition-all duration-200
          flex items-center justify-center gap-2
        "
      >
        {isExporting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Export QR Code</span>
          </>
        )}
      </button>
    </div>
  );
}
