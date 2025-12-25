/**
 * Prize template form fields components
 */
import {
  Coffee,
  CircleDollarSign,
  Utensils,
  ShoppingBag,
  Percent,
  Gift,
  Star,
  Heart,
  Sparkles,
  TrendingUp,
  Award,
} from 'lucide-react';

const availableIcons = [
  { name: 'Coffee', icon: Coffee, label: 'Café' },
  { name: 'Utensils', icon: Utensils, label: 'Restaurant' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'Shopping' },
  { name: 'Percent', icon: Percent, label: 'Réduction' },
  { name: 'Gift', icon: Gift, label: 'Cadeau' },
  { name: 'Star', icon: Star, label: 'Étoile' },
  { name: 'Heart', icon: Heart, label: 'Cœur' },
  { name: 'Sparkles', icon: Sparkles, label: 'Sparkles' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'Tendance' },
  { name: 'Award', icon: Award, label: 'Récompense' },
  { name: 'CircleDollarSign', icon: CircleDollarSign, label: 'Prix' },
];

interface Brand {
  id: string;
  name: string;
  logoUrl: string;
}

interface BrandSelectProps {
  value: string;
  onChange: (value: string) => void;
  brands: Brand[];
}

export function BrandSelect({ value, onChange, brands }: BrandSelectProps) {
  return (
    <div>
      <label htmlFor="brandId" className="block text-sm font-medium text-gray-700 mb-2">
        Enseigne *
      </label>
      <select
        id="brandId"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
        required
      >
        <option value="">Sélectionner...</option>
        <option value="COMMON">🔄 Commun à toutes les enseignes</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}

export function TextInput({ id, label, value, onChange, placeholder, required }: TextInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

interface TextAreaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}

export function TextArea({ id, label, value, onChange, placeholder, rows = 3 }: TextAreaProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

interface PriceInputProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder: string;
}

export function PriceInput({ id, label, value, onChange, placeholder }: PriceInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="number"
        id={id}
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
        placeholder={placeholder}
      />
    </div>
  );
}

interface IconSelectorProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
}

export function IconSelector({ selectedIcon, onSelect }: IconSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Icône</label>
      <div className="grid grid-cols-6 gap-2">
        {availableIcons.map((iconConfig) => {
          const IconComponent = iconConfig.icon;
          return (
            <button
              key={iconConfig.name}
              type="button"
              onClick={() => onSelect(iconConfig.name)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedIcon === iconConfig.name
                  ? 'border-purple-600 bg-purple-100'
                  : 'border-purple-600/20 bg-white/50 hover:border-purple-600/40'
              }`}
              title={iconConfig.label}
            >
              <IconComponent className="w-5 h-5 text-purple-600 mx-auto" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div>
      <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
        Couleur
      </label>
      <input
        type="color"
        id="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 py-2 bg-white/50 border border-purple-600/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
      />
    </div>
  );
}
