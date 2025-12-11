import { useState, useCallback } from 'react';
import type { ExportFormat, QRCodeExportOptions } from '@/lib/types/qr-code.types';
import { createQRCodeInstance, exportQRCode } from '@/lib/utils/qr-code-generator';
import { toast } from '@/hooks/use-toast';

/**
 * Custom hook for exporting QR codes in various formats
 *
 * @param qrCodeDataUrl - The data URL of the QR code to export
 * @param qrCodeOptions - Options used to recreate the QR code instance
 * @returns Object containing export state and exportAs function
 */
export function useQRCodeExport(qrCodeDataUrl: string | null, qrCodeOptions: QRCodeExportOptions) {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Exports the QR code in the specified format
   *
   * @param format - The export format (png, svg, jpg, webp)
   * @param size - The size of the exported QR code in pixels
   * @param filename - Optional custom filename for the exported file
   */
  const exportAs = useCallback(
    async (format: ExportFormat, size: number, filename?: string): Promise<void> => {
      if (!qrCodeDataUrl) {
        const errorMessage = 'No QR code available to export';
        setError(errorMessage);
        toast({
          title: 'Export Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      setIsExporting(true);
      setError(null);

      try {
        // Create QR code instance
        const qrCodeInstance = createQRCodeInstance(qrCodeOptions);

        // Export in specified format
        const blob = await exportQRCode(qrCodeInstance, format, size);

        // Download file
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `qr-code.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Show success toast
        toast({
          title: 'Export Successful',
          description: `QR code exported as ${format.toUpperCase()}`,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to export QR code';
        setError(errorMessage);
        toast({
          title: 'Export Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsExporting(false);
      }
    },
    [qrCodeDataUrl, qrCodeOptions],
  );

  return {
    isExporting,
    error,
    exportAs,
  };
}
