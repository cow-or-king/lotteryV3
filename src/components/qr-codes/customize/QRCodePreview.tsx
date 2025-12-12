import type { RefObject } from 'react';

interface QRCodePreviewProps {
  qrCodeRef: RefObject<HTMLDivElement | null>;
}

export function QRCodePreview({ qrCodeRef }: QRCodePreviewProps) {
  return (
    <div className="mb-6 flex justify-center">
      <div className="p-4 bg-white border-2 border-purple-200 rounded-2xl shadow-lg">
        <div ref={qrCodeRef} className="flex items-center justify-center" />
        <p className="text-xs text-center text-gray-500 mt-2">Pr�visualisation en temps r�el</p>
      </div>
    </div>
  );
}
