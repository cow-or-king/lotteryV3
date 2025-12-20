/**
 * Edit Campaign Modal
 * Modal pour éditer les paramètres basiques d'une campagne
 */

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';

interface EditCampaignModalProps {
  isOpen: boolean;
  campaign: {
    id: string;
    name: string;
    description?: string | null;
    maxParticipants?: number | null;
    minDaysBetweenPlays?: number | null;
    prizeClaimExpiryDays?: number | null;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCampaignModal({
  isOpen,
  campaign,
  onClose,
  onSuccess,
}: EditCampaignModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number | null>(null);
  const [minDaysBetweenPlays, setMinDaysBetweenPlays] = useState<number | null>(null);
  const [prizeClaimExpiryDays, setPrizeClaimExpiryDays] = useState(30);
  const [hasMaxParticipants, setHasMaxParticipants] = useState(false);
  const [hasMinDays, setHasMinDays] = useState(false);

  const utils = api.useUtils();
  const updateMutation = api.campaign.update.useMutation({
    onSuccess: () => {
      toast.success('Campagne modifiée avec succès');
      void utils.campaign.listAll.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la modification');
    },
  });

  // Initialize form when campaign changes
  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setDescription(campaign.description || '');
      setMaxParticipants(campaign.maxParticipants || null);
      setMinDaysBetweenPlays(campaign.minDaysBetweenPlays || null);
      setPrizeClaimExpiryDays(campaign.prizeClaimExpiryDays || 30);
      setHasMaxParticipants(!!campaign.maxParticipants);
      setHasMinDays(!!campaign.minDaysBetweenPlays);
    }
  }, [campaign]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaign) return;

    updateMutation.mutate({
      id: campaign.id,
      name,
      description,
      maxParticipants: hasMaxParticipants ? maxParticipants : null,
      minDaysBetweenPlays: hasMinDays ? minDaysBetweenPlays : null,
      prizeClaimExpiryDays,
    });
  };

  if (!isOpen || !campaign) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Modifier la campagne</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom de la campagne *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              required
              minLength={2}
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
            />
          </div>

          {/* Max Participants */}
          <div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasMaxParticipants"
                checked={hasMaxParticipants}
                onChange={(e) => {
                  setHasMaxParticipants(e.target.checked);
                  if (!e.target.checked) {
                    setMaxParticipants(null);
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="hasMaxParticipants" className="text-sm font-medium text-gray-700">
                Limiter le nombre de participants
              </label>
            </div>
            {hasMaxParticipants && (
              <input
                type="number"
                value={maxParticipants || ''}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                min={1}
                max={1000000}
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                placeholder="Nombre maximum de participants"
              />
            )}
          </div>

          {/* Min Days Between Plays */}
          <div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasMinDays"
                checked={hasMinDays}
                onChange={(e) => {
                  setHasMinDays(e.target.checked);
                  if (!e.target.checked) {
                    setMinDaysBetweenPlays(null);
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="hasMinDays" className="text-sm font-medium text-gray-700">
                Délai minimum entre deux participations
              </label>
            </div>
            {hasMinDays && (
              <div className="mt-2">
                <input
                  type="number"
                  value={minDaysBetweenPlays || ''}
                  onChange={(e) => setMinDaysBetweenPlays(Number(e.target.value))}
                  min={1}
                  max={365}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                  placeholder="Nombre de jours"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Nombre de jours minimum entre deux scans du QR code
                </p>
              </div>
            )}
          </div>

          {/* Prize Claim Expiry */}
          <div>
            <label
              htmlFor="prizeClaimExpiryDays"
              className="block text-sm font-medium text-gray-700"
            >
              Délai de réclamation des lots (jours)
            </label>
            <input
              id="prizeClaimExpiryDays"
              type="number"
              value={prizeClaimExpiryDays}
              onChange={(e) => setPrizeClaimExpiryDays(Number(e.target.value))}
              min={1}
              max={365}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Nombre de jours avant expiration d&apos;un lot gagné
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={updateMutation.isPending}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Modification...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
