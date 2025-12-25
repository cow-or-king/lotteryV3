/**
 * Monthly/Annual pricing toggle
 */
interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

export function PricingToggle({ isAnnual, onToggle }: PricingToggleProps) {
  return (
    <div className="inline-flex items-center gap-4 p-2 bg-white rounded-xl shadow-md border border-gray-200">
      <button
        onClick={() => onToggle(false)}
        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
          !isAnnual ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Mensuel
      </button>
      <button
        onClick={() => onToggle(true)}
        className={`px-6 py-3 rounded-lg font-semibold transition-all relative ${
          isAnnual ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Annuel
        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
          -20%
        </span>
      </button>
    </div>
  );
}
