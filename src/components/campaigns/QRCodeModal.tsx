/**
 * Composant QRCodeModal
 * Modal pour afficher et télécharger le QR code d'une campagne
 */

'use client';

import Image from 'next/image';
import { toast } from 'sonner';

export type QRCodeModalProps = {
  isOpen: boolean;
  qrCode: {
    id: string;
    url: string;
    campaignName: string;
  } | null;
  onClose: () => void;
};

export default function QRCodeModal({ isOpen, qrCode, onClose }: QRCodeModalProps) {
  if (!isOpen || !qrCode) {
    return null;
  }

  const campaignUrl = `${window.location.origin}/c/${qrCode.id}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(campaignUrl);
    toast.success('URL copiée !');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCode.url;
    link.download = `qr-code-${qrCode.campaignName}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">QR Code de la campagne</h3>
              <p className="mt-1 text-sm text-gray-500">{qrCode.campaignName}</p>
            </div>
          </div>
          <div className="flex justify-center bg-gray-50 p-8 rounded-lg">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Image
                src={qrCode.url}
                alt={`QR Code - ${qrCode.campaignName}`}
                width={200}
                height={200}
                className="w-48 h-48"
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-1">URL de la campagne:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={campaignUrl}
                className="flex-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded font-mono"
              />
              <button
                onClick={handleCopyUrl}
                className="px-2 py-1 text-xs font-medium text-white bg-purple-600 rounded hover:bg-purple-700"
              >
                Copier
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-center text-gray-500">
            Scannez ce QR code ou partagez l&apos;URL pour accéder à cette campagne
          </p>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Fermer
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
          >
            Télécharger QR
          </button>
        </div>
      </div>
    </div>
  );
}
