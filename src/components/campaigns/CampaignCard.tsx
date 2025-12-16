/**
 * Composant CampaignCard
 * Affiche une carte de campagne avec toutes ses informations et actions
 */

'use client';

import { Gift, Users, ExternalLink, Trash2, Edit2, QrCode, Power } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export type CampaignCardProps = {
  campaign: {
    id: string;
    name: string;
    description?: string | null;
    storeName: string;
    isActive: boolean;
    maxParticipants?: number | null;
    qrCodeUrl?: string | null;
    _count: {
      prizes: number;
      participants: number;
    };
  };
  isToggling: boolean;
  onToggleClick: (campaign: { id: string; name: string; isActive: boolean }) => void;
  onDeleteClick: (campaign: { id: string; name: string }) => void;
  onQRCodeClick: (campaign: { id: string; url: string; campaignName: string }) => void;
};

export default function CampaignCard({
  campaign,
  isToggling,
  onToggleClick,
  onDeleteClick,
  onQRCodeClick,
}: CampaignCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Status Badge + Toggle + QR Code Icon */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              campaign.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {campaign.isActive ? 'Active' : 'Inactive'}
          </span>
          {campaign.isActive && campaign.qrCodeUrl && (
            <button
              onClick={() => {
                onQRCodeClick({
                  id: campaign.id,
                  url: campaign.qrCodeUrl ?? '',
                  campaignName: campaign.name,
                });
              }}
              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
              title="Voir le QR Code"
            >
              <QrCode className="h-3 w-3" />
              QR
            </button>
          )}
        </div>
        <button
          onClick={() => onToggleClick(campaign)}
          disabled={isToggling}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            campaign.isActive
              ? 'bg-red-50 text-red-700 hover:bg-red-100'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={campaign.isActive ? 'Désactiver' : 'Activer'}
        >
          <Power className="h-3 w-3" />
          {campaign.isActive ? 'Désactiver' : 'Activer'}
        </button>
      </div>

      {/* Campaign Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>

      {/* Store Name */}
      <p className="text-sm text-purple-600 mb-2">{campaign.storeName}</p>

      {/* Description */}
      {campaign.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
      )}

      {/* Stats */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Gift className="h-4 w-4" />
          <span>{campaign._count.prizes} lots</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Users className="h-4 w-4" />
          <span>
            {campaign._count.participants} participant
            {campaign._count.participants > 1 ? 's' : ''}
            {campaign.maxParticipants && ` / ${campaign.maxParticipants}`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
        <Link
          href={`/c/${campaign.id}`}
          target="_blank"
          className="flex-1 rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-1"
        >
          <ExternalLink className="h-4 w-4" />
          Tester
        </Link>
        <button
          className="flex-1 rounded-md bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 flex items-center justify-center gap-1"
          onClick={() => toast.info('Modifier (à implémenter)')}
        >
          <Edit2 className="h-4 w-4" />
          Modifier
        </button>
        <button
          className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 flex items-center justify-center gap-1"
          onClick={() => onDeleteClick(campaign)}
          title="Supprimer la campagne"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
