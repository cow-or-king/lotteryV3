import { useState, useCallback } from 'react';
import {
  QRCodeGenerationOptions,
  QRCodeGenerationResult,
  QRCodeStyle,
  QRCodeAnimation,
  DEFAULT_FOREGROUND_COLOR,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_QR_CODE_SIZE,
  DEFAULT_LOGO_SIZE,
} from '@/lib/types/qr-code.types';
import { generateQRCode } from '@/lib/utils/qr-code-generator';

/**
 * Custom hook for QR code generation with configurable options
 *
 * @returns Object containing state values, generation function, and setter functions
 */
export function useQRCodeGenerator() {
  const [url, setUrl] = useState<string>('');
  const [style, setStyle] = useState<QRCodeStyle>('DOTS');
  const [animation, setAnimation] = useState<QRCodeAnimation | null>('NONE');
  const [foregroundColor, setForegroundColor] = useState<string>(DEFAULT_FOREGROUND_COLOR);
  const [backgroundColor, setBackgroundColor] = useState<string>(DEFAULT_BACKGROUND_COLOR);
  const [animationColor, setAnimationColor] = useState<string>('#8b5cf6'); // Purple by default
  const [size, setSize] = useState<number>(DEFAULT_QR_CODE_SIZE);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<number>(DEFAULT_LOGO_SIZE);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [qrCodeResult, setQrCodeResult] = useState<QRCodeGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generates a QR code based on current state values
   *
   * @throws Will set error state if generation fails
   */
  const generate = useCallback(async (): Promise<void> => {
    setIsGenerating(true);
    setError(null);

    try {
      const options: QRCodeGenerationOptions = {
        url,
        style,
        animation,
        foregroundColor,
        backgroundColor,
        size,
        errorCorrectionLevel: 'M',
        logoUrl,
        logoSize,
      };

      const result = await generateQRCode(options);
      setQrCodeResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMessage);
      setQrCodeResult(null);
    } finally {
      setIsGenerating(false);
    }
  }, [url, style, animation, foregroundColor, backgroundColor, size, logoUrl, logoSize]);

  /**
   * Resets all state values to their defaults
   */
  const reset = useCallback((): void => {
    setUrl('');
    setStyle('DOTS');
    setAnimation('NONE');
    setForegroundColor(DEFAULT_FOREGROUND_COLOR);
    setBackgroundColor(DEFAULT_BACKGROUND_COLOR);
    setAnimationColor('#8b5cf6');
    setSize(DEFAULT_QR_CODE_SIZE);
    setLogoUrl(null);
    setLogoSize(DEFAULT_LOGO_SIZE);
    setIsGenerating(false);
    setQrCodeResult(null);
    setError(null);
  }, []);

  return {
    url,
    setUrl,
    style,
    setStyle,
    animation,
    setAnimation,
    foregroundColor,
    setForegroundColor,
    backgroundColor,
    setBackgroundColor,
    animationColor,
    setAnimationColor,
    size,
    setSize,
    logoUrl,
    setLogoUrl,
    logoSize,
    setLogoSize,
    isGenerating,
    qrCodeResult,
    error,
    generate,
    reset,
  };
}
