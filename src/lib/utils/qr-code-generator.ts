/**
 * QR Code Generator Utilities
 * Handles QR code generation using qr-code-styling library
 * IMPORTANT: ZERO any types
 */

import QRCodeStyling from 'qr-code-styling';
import type {
  QRCodeGenerationOptions,
  QRCodeGenerationResult,
  QRCodeStyle,
  QRCodeExportOptions,
} from '@/lib/types/qr-code.types';

// =====================
// STYLE CONFIGURATIONS
// =====================

/**
 * Gets QRCodeStyling configuration for a given style
 * @param style - The QR code style to configure
 * @param foregroundColor - The foreground color
 * @param backgroundColor - The background color
 * @param logoUrl - Optional logo URL
 * @param logoSize - Optional logo size in pixels
 * @param size - QR code size in pixels
 * @returns QRCodeStyling configuration object
 */
export function getQRCodeStyleConfig(
  style: QRCodeStyle,
  foregroundColor: string,
  backgroundColor: string,
  logoUrl?: string | null,
  logoSize?: number,
  size?: number,
): {
  dotsOptions: {
    type: 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
    color: string;
  };
  cornersSquareOptions: {
    type: 'dot' | 'square' | 'extra-rounded';
    color: string;
  };
  backgroundOptions: { color: string };
  imageOptions?: {
    hideBackgroundDots: boolean;
    imageSize: number;
    margin: number;
  };
} {
  const baseConfig = {
    dotsOptions: {
      color: foregroundColor,
      type: 'square' as
        | 'dots'
        | 'rounded'
        | 'classy'
        | 'classy-rounded'
        | 'square'
        | 'extra-rounded',
    },
    cornersSquareOptions: {
      color: foregroundColor,
      type: 'square' as 'dot' | 'square' | 'extra-rounded',
    },
    backgroundOptions: {
      color: backgroundColor,
    },
  };

  // Configure style-specific options
  switch (style) {
    case 'DOTS':
      baseConfig.dotsOptions.type = 'dots';
      baseConfig.cornersSquareOptions.type = 'dot';
      break;

    case 'ROUNDED':
      baseConfig.dotsOptions.type = 'rounded';
      baseConfig.cornersSquareOptions.type = 'extra-rounded';
      break;

    case 'SQUARE':
      baseConfig.dotsOptions.type = 'square';
      baseConfig.cornersSquareOptions.type = 'square';
      break;

    case 'CLASSY':
      baseConfig.dotsOptions.type = 'classy-rounded';
      baseConfig.cornersSquareOptions.type = 'extra-rounded';
      break;

    case 'CIRCULAR':
      baseConfig.dotsOptions.type = 'extra-rounded';
      baseConfig.cornersSquareOptions.type = 'extra-rounded';
      break;

    default:
      // Default to square
      baseConfig.dotsOptions.type = 'square';
      baseConfig.cornersSquareOptions.type = 'square';
  }

  // Add image options if logo is provided
  if (logoUrl && logoSize && size) {
    return {
      ...baseConfig,
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: logoSize / size,
        margin: 5,
      },
    };
  }

  return baseConfig;
}

// =====================
// QR CODE INSTANCE
// =====================

/**
 * Creates a QRCodeStyling instance with the given options
 * @param options - QR code generation options
 * @returns QRCodeStyling instance
 */
export function createQRCodeInstance(options: QRCodeGenerationOptions): QRCodeStyling {
  const {
    url,
    style,
    foregroundColor,
    backgroundColor,
    size,
    errorCorrectionLevel,
    logoUrl,
    logoSize,
    margin = 0,
  } = options;

  // Get style configuration
  const styleConfig = getQRCodeStyleConfig(
    style,
    foregroundColor,
    backgroundColor,
    logoUrl,
    logoSize,
    size,
  );

  // Create QRCodeStyling instance
  const qrCode = new QRCodeStyling({
    width: size,
    height: size,
    type: 'svg',
    data: url,
    margin,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
    },
    imageOptions: styleConfig.imageOptions,
    dotsOptions: styleConfig.dotsOptions,
    backgroundOptions: styleConfig.backgroundOptions,
    cornersSquareOptions: styleConfig.cornersSquareOptions,
    cornersDotOptions: {
      color: foregroundColor,
      type: undefined,
    },
    image: logoUrl || undefined,
  });

  return qrCode;
}

// =====================
// QR CODE GENERATION
// =====================

/**
 * Generates a QR code with the specified options
 * Returns dataUrl, svg, and blob for various use cases
 * @param options - QR code generation options
 * @returns Promise resolving to QR code generation result
 * @throws Error if generation fails
 */
export async function generateQRCode(
  options: QRCodeGenerationOptions,
): Promise<QRCodeGenerationResult> {
  try {
    // Validate URL
    if (!options.url || options.url.trim().length === 0) {
      throw new Error('URL is required for QR code generation');
    }

    // Validate size
    if (options.size <= 0) {
      throw new Error('Size must be a positive number');
    }

    // Create QR code instance
    const qrCode = createQRCodeInstance(options);

    // Generate PNG blob
    const pngData = await qrCode.getRawData('png');
    if (!pngData) {
      throw new Error('Failed to generate QR code PNG data');
    }
    const blob = pngData as Blob;

    // Convert blob to data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to data URL'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(blob);
    });

    // Generate SVG string
    const svgData = await qrCode.getRawData('svg');
    if (!svgData) {
      throw new Error('Failed to generate QR code SVG data');
    }
    const svgBlob = svgData as Blob;

    const svg = await svgBlob.text();

    return {
      dataUrl,
      svg,
      blob,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`QR code generation failed: ${error.message}`);
    }
    throw new Error('QR code generation failed: Unknown error');
  }
}

// =====================
// QR CODE EXPORT
// =====================

/**
 * Exports a QR code in the specified format
 * @param qrCode - QRCodeStyling instance to export
 * @param options - Export options including format and quality
 * @returns Promise resolving to a Blob of the exported QR code
 * @throws Error if export format is not supported or export fails
 */
export async function exportQRCode(
  qrCode: QRCodeStyling,
  options: QRCodeExportOptions,
): Promise<Blob> {
  const { format } = options;

  try {
    switch (format) {
      case 'PNG': {
        const pngData = await qrCode.getRawData('png');
        if (!pngData) {
          throw new Error('Failed to export QR code as PNG');
        }
        return pngData as Blob;
      }

      case 'SVG': {
        const svgData = await qrCode.getRawData('svg');
        if (!svgData) {
          throw new Error('Failed to export QR code as SVG');
        }
        return svgData as Blob;
      }

      case 'PDF':
        throw new Error('PDF export coming soon');

      default:
        throw new Error(`Unsupported export format: ${format as string}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`QR code export failed: ${error.message}`);
    }
    throw new Error('QR code export failed: Unknown error');
  }
}

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Downloads a QR code blob with the specified filename
 * @param blob - The QR code blob to download
 * @param filename - The filename for the download
 */
export function downloadQRCode(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates QR code generation options
 * @param options - Options to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateQRCodeOptions(options: QRCodeGenerationOptions): string[] {
  const errors: string[] = [];

  if (!options.url || options.url.trim().length === 0) {
    errors.push('URL is required');
  }

  if (options.url && options.url.length > 2048) {
    errors.push('URL must be less than 2048 characters');
  }

  if (options.size <= 0) {
    errors.push('Size must be a positive number');
  }

  if (options.logoSize && options.logoSize <= 0) {
    errors.push('Logo size must be a positive number');
  }

  if (options.logoSize && options.size && options.logoSize > options.size * 0.3) {
    errors.push('Logo size should not exceed 30% of QR code size');
  }

  return errors;
}
