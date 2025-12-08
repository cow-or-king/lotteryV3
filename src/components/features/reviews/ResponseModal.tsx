/**
 * Modal de réponse à une review
 */

'use client';

import { X } from 'lucide-react';

interface Review {
  reviewId: string;
  authorName: string;
  rating: number;
  comment: string | null;
  publishedAt: Date;
  hasResponse: boolean;
}

interface ResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  onSubmit: (response: string) => void;
}

export function ResponseModal({ isOpen, onClose, review }: ResponseModalProps) {
  if (!isOpen || !review) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl"></div>
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Répondre à l&apos;avis</h3>
              <p className="text-sm text-gray-600 mt-1">Auteur : {review.authorName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Avis original :</p>
              <p className="text-gray-800">{review.comment || 'Aucun commentaire'}</p>
            </div>

            <div>
              <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                Votre réponse
              </label>
              <textarea
                id="response"
                rows={6}
                className="w-full px-4 py-3 bg-white border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all resize-none"
                placeholder="Écrivez votre réponse..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white/50 hover:bg-white/70 border border-purple-600/20 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Envoyer la réponse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
