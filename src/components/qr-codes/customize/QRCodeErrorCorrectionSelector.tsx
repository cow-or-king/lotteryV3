import type { ErrorCorrectionLevel } from '@/lib/types/qr-code.types';
import { QR_CODE_ERROR_CORRECTION_LEVELS } from '@/lib/constants/qr-code.constants';

interface QRCodeErrorCorrectionSelectorProps {
  selectedLevel: ErrorCorrectionLevel;
  onLevelChange: (level: ErrorCorrectionLevel) => void;
}

export function QRCodeErrorCorrectionSelector({
  selectedLevel,
  onLevelChange,
}: QRCodeErrorCorrectionSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Niveau de correction d&apos;erreur
      </label>
      <div className="grid grid-cols-2 gap-2">
        {QR_CODE_ERROR_CORRECTION_LEVELS.map((ecl) => (
          <button
            key={ecl.value}
            type="button"
            onClick={() => onLevelChange(ecl.value)}
            className={`p-3 border-2 rounded-xl text-left transition-all ${
              selectedLevel === ecl.value
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="text-sm font-medium text-gray-700">{ecl.label}</div>
            <div className="text-xs text-gray-500 mt-1">{ecl.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
