'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Edit2,
  MapPin,
  MoreVertical,
  QrCode,
  Trash2,
} from 'lucide-react';

interface StoreCardProps {
  store: {
    id: string;
    name: string;
    slug: string;
    googleBusinessUrl: string;
    googlePlaceId: string | null;
    createdAt: string | Date;
    defaultQrCodeId: string | null;
    qrCodeCustomized: boolean;
    qrCodeCustomizedAt: string | null;
    logoUrl: string | null;
  };
  openMenuId: string | null;
  onMenuToggle: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onCustomizeQRCode: () => void;
}

export function StoreCard({
  store,
  openMenuId,
  onMenuToggle,
  onEdit,
  onDelete,
  onCustomizeQRCode,
}: StoreCardProps) {
  return (
    <div className="group bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 hover:bg-white/60 hover:border-purple-600/30 transition-all duration-300 hover:scale-[1.02] relative">
      {/* Menu 3 points */}
      <div className="absolute top-4 right-4">
        <button
          data-menu-button
          onClick={(e) => {
            e.stopPropagation();
            onMenuToggle(store.id);
          }}
          className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>

        {/* Menu dropdown */}
        {openMenuId === store.id && (
          <div
            data-menu-dropdown
            className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-purple-600/20 py-2 z-10"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCustomizeQRCode();
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              {store.qrCodeCustomized ? 'Télécharger QR Code' : 'Personnaliser QR Code'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Nom du commerce */}
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors mb-1 truncate">
          {store.name}
        </h3>
        <p className="text-xs text-gray-500 truncate">/{store.slug}</p>
      </div>

      {/* Google Business URL avec badge Avis vérifié/non vérifié */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 shrink-0" />
          <a
            href={store.googleBusinessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="line-clamp-1 hover:text-purple-600 transition-colors"
          >
            Google Business Profile
          </a>
        </div>

        {/* Badge Avis vérifié/non vérifié - cliquable si non configuré */}
        {!store.googlePlaceId || store.googlePlaceId.trim().length === 0 ? (
          <a
            href="/dashboard/reviews"
            title="Cliquez pour configurer l'API Google et vérifier les avis"
            className="flex items-center gap-1 px-2 py-1 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors cursor-pointer"
          >
            <AlertCircle className="w-3 h-3 text-orange-600 shrink-0" />
            <span className="text-xs text-orange-800 font-medium">Avis non vérifiés</span>
          </a>
        ) : (
          <div
            title="API Google configurée - Les avis sont vérifiés"
            className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-md"
          >
            <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
            <span className="text-xs text-green-800 font-medium">Avis vérifiés</span>
          </div>
        )}
      </div>

      {/* Date + Badge IA */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Créé le {new Date(store.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>

        {/* Badge IA - bientôt disponible */}
        <div
          title="L'assistance IA sera bientôt disponible"
          className="flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-md"
        >
          <span className="text-xs text-purple-600 font-medium">IA bientôt dispo</span>
        </div>
      </div>

      {/* Stats + QR Code preview */}
      <div className="pt-4 border-t border-purple-600/20">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div>
              <p className="text-xs text-gray-600 mb-1">Campagnes</p>
              <p className="text-lg font-bold text-gray-800">0</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Participants</p>
              <p className="text-lg font-bold text-gray-800">0</p>
            </div>
          </div>

          {/* QR Code mini preview */}
          {store.defaultQrCodeId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCustomizeQRCode();
              }}
              className="ml-4 group/qr relative"
              title={store.qrCodeCustomized ? 'Télécharger QR Code' : 'Personnaliser QR Code'}
            >
              <div className="w-12 h-12 bg-purple-50 border-2 border-purple-200 rounded-lg flex items-center justify-center group-hover/qr:border-purple-400 transition-colors">
                <QrCode className="w-6 h-6 text-purple-600" />
              </div>
              {store.qrCodeCustomized && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
