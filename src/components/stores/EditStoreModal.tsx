'use client';

import { HelpCircle, X } from 'lucide-react';

interface EditStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: {
    id: string;
    name: string;
    googleBusinessUrl: string;
  } | null;
  setStore: (store: EditStoreModalProps['store']) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  onShowGoogleUrlHelp: () => void;
  storeBrand?: {
    brandName: string;
    logoUrl: string;
  } | null;
}

export function EditStoreModal({
  isOpen,
  onClose,
  store,
  setStore,
  onSubmit,
  isSubmitting,
  onShowGoogleUrlHelp,
  storeBrand,
}: EditStoreModalProps) {
  if (!isOpen || !store) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 rounded-3xl">
      <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {storeBrand && (
              <img
                src={storeBrand.logoUrl}
                alt="Logo"
                className="w-10 h-10 rounded-xl object-cover"
              />
            )}
            <h2 className="text-2xl font-bold text-purple-600">
              {storeBrand?.brandName || 'Modifier'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="edit-store-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nom du commerce *
            </label>
            <input
              type="text"
              id="edit-store-name"
              value={store.name}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              placeholder="Ex: McDonald's Champs-Élysées"
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-store-url"
              className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              URL Google Business *
              <button
                type="button"
                onClick={onShowGoogleUrlHelp}
                className="text-purple-600 hover:text-purple-700 transition-colors"
                title="Comment trouver mon URL ?"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </label>
            <input
              type="url"
              id="edit-store-url"
              value={store.googleBusinessUrl}
              onChange={(e) => setStore({ ...store, googleBusinessUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              placeholder="https://g.page/..."
              required
            />
            <p className="text-xs text-gray-600 mt-1">
              URL de votre page Google Business (pour laisser un avis)
            </p>
          </div>

          {/* Info pour configurer Place ID dans /reviews */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              💡 Pour configurer le <strong>Google Place ID</strong> et l'
              <strong>API Google</strong>, rendez-vous dans la section <strong>Avis Google</strong>.
            </p>
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
