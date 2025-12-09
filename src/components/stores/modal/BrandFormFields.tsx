/**
 * Brand Form Fields Component
 * Champs de formulaire pour créer une nouvelle enseigne
 */

'use client';

interface BrandFormFieldsProps {
  brandName: string;
  logoUrl: string;
  errors: {
    brandName?: string;
    logoUrl?: string;
  };
  onChange: (field: 'brandName' | 'logoUrl', value: string) => void;
}

export function BrandFormFields({ brandName, logoUrl, errors, onChange }: BrandFormFieldsProps) {
  return (
    <>
      {/* Nom de l'enseigne */}
      <div>
        <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-2">
          Nom de l'enseigne *
        </label>
        <input
          type="text"
          id="brandName"
          value={brandName}
          onChange={(e) => onChange('brandName', e.target.value)}
          className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
          placeholder="Ex: McDonald's"
        />
        {errors.brandName && <p className="text-red-600 text-sm mt-1">{errors.brandName}</p>}
      </div>

      {/* Logo URL */}
      <div>
        <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
          URL du logo *
        </label>
        <input
          type="url"
          id="logoUrl"
          value={logoUrl}
          onChange={(e) => onChange('logoUrl', e.target.value)}
          className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
          placeholder="https://example.com/logo.png"
          required
        />
        {errors.logoUrl && <p className="text-red-600 text-sm mt-1">{errors.logoUrl}</p>}
        <p className="text-xs text-gray-600 mt-1">
          URL publique de votre logo (jpg, png, svg) - utilisée pour l'interface client
        </p>
      </div>
    </>
  );
}
