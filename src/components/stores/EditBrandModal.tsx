'use client';

import { X } from 'lucide-react';

interface EditBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: {
    id: string;
    name: string;
    logoUrl: string;
  } | null;
  setBrand: (brand: EditBrandModalProps['brand']) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function EditBrandModal({
  isOpen,
  onClose,
  brand,
  setBrand,
  onSubmit,
  isSubmitting,
}: EditBrandModalProps) {
  if (!isOpen || !brand) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 rounded-3xl">
      <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Modifier l'enseigne</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="edit-brand-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nom de l'enseigne *
            </label>
            <input
              type="text"
              id="edit-brand-name"
              value={brand.name}
              onChange={(e) => setBrand({ ...brand, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              placeholder="Ex: McDonald's"
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-brand-logo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL du logo *
            </label>
            <input
              type="url"
              id="edit-brand-logo"
              value={brand.logoUrl}
              onChange={(e) => setBrand({ ...brand, logoUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              placeholder="https://example.com/logo.png"
              required
            />
            <p className="text-xs text-gray-600 mt-1">URL publique de votre logo (jpg, png, svg)</p>
          </div>

          {/* Buttons */}
          <div className="pt-4">
            <p className="text-xs text-gray-600 italic text-right mb-2">* Champs obligatoires</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white/50 hover:bg-white/70 border border-purple-600/20 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Modification...' : 'Modifier'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
