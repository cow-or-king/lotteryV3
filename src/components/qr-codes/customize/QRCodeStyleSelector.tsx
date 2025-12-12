import type { QRCodeStyle } from '@/lib/types/qr-code.types';
import { QR_CODE_STYLES } from '@/lib/constants/qr-code.constants';

interface QRCodeStyleSelectorProps {
  selectedStyle: QRCodeStyle;
  onStyleChange: (style: QRCodeStyle) => void;
}

export function QRCodeStyleSelector({ selectedStyle, onStyleChange }: QRCodeStyleSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Style</label>
      <div className="grid grid-cols-5 gap-2">
        {QR_CODE_STYLES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onStyleChange(s.value)}
            className={`p-3 border-2 rounded-xl text-center transition-all ${
              selectedStyle === s.value
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xs font-medium text-gray-700">{s.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
