interface QRCodeColorPickersProps {
  foregroundColor: string;
  backgroundColor: string;
  onForegroundColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
}

export function QRCodeColorPickers({
  foregroundColor,
  backgroundColor,
  onForegroundColorChange,
  onBackgroundColorChange,
}: QRCodeColorPickersProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Couleur principale</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={foregroundColor}
            onChange={(e) => onForegroundColorChange(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
          />
          <input
            type="text"
            value={foregroundColor}
            onChange={(e) => onForegroundColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 placeholder:text-gray-400"
            placeholder="#000000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de fond</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
          />
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 placeholder:text-gray-400"
            placeholder="#FFFFFF"
          />
        </div>
      </div>
    </div>
  );
}
