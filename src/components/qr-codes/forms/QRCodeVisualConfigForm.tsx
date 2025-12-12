/**
 * QRCodeVisualConfigForm
 * Formulaire de configuration visuelle du QR code
 * IMPORTANT: ZERO any types
 */

import {
  QRCodeStyleSelector,
  QRCodeAnimationSelector,
  QRCodeColorPicker,
  QRCodeLogoUpload,
} from '@/components/qr-codes';
import type { QRCodeStyle, QRCodeAnimation } from '@/lib/types/qr-code.types';

interface QRCodeVisualConfigFormProps {
  style: QRCodeStyle;
  onStyleChange: (style: QRCodeStyle) => void;
  animation: QRCodeAnimation | null;
  onAnimationChange: (animation: QRCodeAnimation | null) => void;
  foregroundColor: string;
  backgroundColor: string;
  animationColor: string | null;
  onForegroundColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onAnimationColorChange: (color: string | null) => void;
  logoUrl: string | null;
  onLogoChange: (url: string | null, file: File | null) => Promise<void>;
  logoSize: number;
  onLogoSizeChange: (size: number) => void;
  isUploadingLogo: boolean;
}

export function QRCodeVisualConfigForm({
  style,
  onStyleChange,
  animation,
  onAnimationChange,
  foregroundColor,
  backgroundColor,
  animationColor,
  onForegroundColorChange,
  onBackgroundColorChange,
  onAnimationColorChange,
  logoUrl,
  onLogoChange,
  logoSize,
  onLogoSizeChange,
  isUploadingLogo,
}: QRCodeVisualConfigFormProps) {
  return (
    <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-lg">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Personnalisation visuelle</h2>

      {/* Style */}
      <div className="mb-4">
        <QRCodeStyleSelector value={style} onChange={onStyleChange} />
      </div>

      {/* Animation */}
      <div className="mb-4">
        <QRCodeAnimationSelector value={animation} onChange={onAnimationChange} />
      </div>

      {/* Colors */}
      <div className="mb-4">
        <QRCodeColorPicker
          foregroundColor={foregroundColor}
          backgroundColor={backgroundColor}
          animationColor={animationColor}
          onForegroundChange={onForegroundColorChange}
          onBackgroundChange={onBackgroundColorChange}
          onAnimationColorChange={onAnimationColorChange}
        />
      </div>

      {/* Logo */}
      <div>
        <QRCodeLogoUpload
          logoUrl={logoUrl}
          onLogoChange={onLogoChange}
          logoSize={logoSize || 80}
          onLogoSizeChange={onLogoSizeChange}
        />
        {isUploadingLogo && (
          <div className="mt-2 text-xs text-purple-600 font-medium">Upload en cours...</div>
        )}
      </div>
    </div>
  );
}
