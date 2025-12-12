import type { LogoSize } from '@/lib/types/qr-code.types';
import { QR_CODE_LOGO_SIZES } from '@/lib/constants/qr-code.constants';

interface QRCodeLogoSizeSelectorProps {
  selectedSize: LogoSize | null;
  onSizeChange: (size: LogoSize | null) => void;
  hasLogo: boolean;
}

export function QRCodeLogoSizeSelector({
  selectedSize,
  onSizeChange,
  hasLogo,
}: QRCodeLogoSizeSelectorProps) {
  if (!hasLogo) {
    return null;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Taille du logo</label>
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => onSizeChange(null)}
          className={`p-3 border-2 rounded-xl text-center transition-all ${
            selectedSize === null
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          <div className="text-xs font-medium text-gray-700">Aucun</div>
        </button>
        {QR_CODE_LOGO_SIZES.map((ls) => (
          <button
            key={ls.value}
            type="button"
            onClick={() => onSizeChange(ls.value)}
            className={`p-3 border-2 rounded-xl text-center transition-all ${
              selectedSize === ls.value
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="text-xs font-medium text-gray-700">{ls.label}</div>
            <div className="text-xs text-gray-500 mt-1">{ls.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
