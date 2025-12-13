/**
 * QR Code Edit Form Component
 * Form section for editing QR code properties
 * IMPORTANT: ZERO any types
 */

'use client';

import {
  QRCodeAnimationSelector,
  QRCodeColorPicker,
  QRCodeLogoUpload,
  QRCodeStoreSelector,
  QRCodeStyleSelector,
} from '@/components/qr-codes';
import type { QRCodeStyle, QRCodeAnimation } from '@/lib/types/qr-code.types';

interface QRCodeEditFormProps {
  name: string;
  nameError: string;
  url: string;
  urlError: string;
  style: QRCodeStyle;
  animation: QRCodeAnimation | null;
  foregroundColor: string;
  backgroundColor: string;
  animationColor: string;
  logoUrl: string | null;
  logoSize: number;
  storeId: string | null;
  isUploadingLogo: boolean;
  onNameChange: (name: string) => void;
  onUrlChange: (url: string) => void;
  onStyleChange: (style: QRCodeStyle) => void;
  onAnimationChange: (animation: QRCodeAnimation | null) => void;
  onForegroundColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onAnimationColorChange: (color: string) => void;
  onLogoChange: (url: string | null, file: File | null) => void;
  onLogoSizeChange: (size: number) => void;
  onStoreIdChange: (storeId: string | null) => void;
}

export function QRCodeEditForm({
  name,
  nameError,
  url,
  urlError,
  style,
  animation,
  foregroundColor,
  backgroundColor,
  animationColor,
  logoUrl,
  logoSize,
  storeId,
  isUploadingLogo,
  onNameChange,
  onUrlChange,
  onStyleChange,
  onAnimationChange,
  onForegroundColorChange,
  onBackgroundColorChange,
  onAnimationColorChange,
  onLogoChange,
  onLogoSizeChange,
  onStoreIdChange,
}: QRCodeEditFormProps) {
  return (
    <div className="space-y-6">
      {/* Name Input */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du QR Code</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ex: QR Code Restaurant"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
        />
        {nameError && <p className="text-red-500 text-sm mt-2">{nameError}</p>}
      </div>

      {/* URL Input */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-2">URL de destination</label>
        <input
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
        />
        {urlError && <p className="text-red-500 text-sm mt-2">{urlError}</p>}
      </div>

      {/* Style Selector */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
        <QRCodeStyleSelector value={style} onChange={onStyleChange} />
      </div>

      {/* Animation Selector */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
        <QRCodeAnimationSelector value={animation} onChange={onAnimationChange} />
      </div>

      {/* Color Pickers */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
        <QRCodeColorPicker
          foregroundColor={foregroundColor}
          backgroundColor={backgroundColor}
          animationColor={animationColor}
          onForegroundChange={onForegroundColorChange}
          onBackgroundChange={onBackgroundColorChange}
          onAnimationColorChange={onAnimationColorChange}
        />
      </div>

      {/* Logo Upload */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
        <QRCodeLogoUpload
          logoUrl={logoUrl}
          onLogoChange={onLogoChange}
          logoSize={logoSize}
          onLogoSizeChange={onLogoSizeChange}
        />
        {isUploadingLogo && (
          <div className="mt-2 text-sm text-purple-600 font-medium">Upload en cours...</div>
        )}
      </div>

      {/* Store Selector */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg">
        <QRCodeStoreSelector value={storeId} onChange={onStoreIdChange} />
      </div>
    </div>
  );
}
