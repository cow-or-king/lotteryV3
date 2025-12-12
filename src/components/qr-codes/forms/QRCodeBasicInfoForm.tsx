/**
 * QRCodeBasicInfoForm
 * Formulaire des informations de base du QR code
 * IMPORTANT: ZERO any types
 */

import { QRCodeStoreSelector } from '@/components/qr-codes';

interface QRCodeBasicInfoFormProps {
  name: string;
  onNameChange: (name: string) => void;
  nameError: string;
  url: string;
  onUrlChange: (url: string) => void;
  urlError: string | null;
  storeId: string | null;
  onStoreIdChange: (storeId: string | null) => void;
}

export function QRCodeBasicInfoForm({
  name,
  onNameChange,
  nameError,
  url,
  onUrlChange,
  urlError,
  storeId,
  onStoreIdChange,
}: QRCodeBasicInfoFormProps) {
  return (
    <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-lg">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Informations de base</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Store */}
        <div>
          <QRCodeStoreSelector value={storeId} onChange={onStoreIdChange} />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du QR Code *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ex: QR Code Restaurant"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
          />
          {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
        </div>
      </div>

      {/* URL */}
      <div className="mt-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          URL de destination *
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900"
        />
        {urlError && <p className="text-red-500 text-xs mt-1">{urlError}</p>}
      </div>
    </div>
  );
}
