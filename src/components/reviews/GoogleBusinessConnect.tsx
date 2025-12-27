/**
 * Google Business Connect Component
 * Permet de connecter et gérer la connexion Google Business Profile API
 *
 * IMPORTANT: ZERO any types
 */

'use client';

import { api } from '@/lib/trpc/client';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { useState } from 'react';

export function GoogleBusinessConnect() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  // Queries
  const { data: connectionStatus, refetch: refetchStatus } =
    api.googleBusiness.getConnectionStatus.useQuery();
  const { data: authUrlData } = api.googleBusiness.getAuthUrl.useQuery(undefined, {
    enabled: !connectionStatus?.isConnected,
  });
  const { data: locations, refetch: refetchLocations } = api.googleBusiness.getLocations.useQuery(
    undefined,
    {
      enabled: connectionStatus?.isConnected && !connectionStatus?.token?.locationId,
    },
  );

  // Mutations
  const selectLocationMutation = api.googleBusiness.selectLocation.useMutation({
    onSuccess: () => {
      void refetchStatus();
      setIsSelecting(false);
    },
  });

  const disconnectMutation = api.googleBusiness.disconnect.useMutation({
    onSuccess: () => {
      void refetchStatus();
    },
  });

  // Handlers
  const handleConnect = () => {
    if (authUrlData?.authUrl) {
      window.location.href = authUrlData.authUrl;
    }
  };

  const handleSelectLocation = () => {
    const location = locations?.locations.find((loc) => loc.locationId === selectedLocationId);
    if (!location) return;

    selectLocationMutation.mutate({
      accountId: location.accountId,
      locationId: location.locationId,
      locationName: location.displayName,
    });
  };

  const handleDisconnect = () => {
    if (confirm('Êtes-vous sûr de vouloir déconnecter votre compte Google Business ?')) {
      disconnectMutation.mutate();
    }
  };

  // Loading state
  if (!connectionStatus) {
    return (
      <GlassCard className="p-6">
        <div className="animate-pulse">
          <div className="h-4 w-48 rounded bg-white/20"></div>
          <div className="mt-2 h-3 w-32 rounded bg-white/10"></div>
        </div>
      </GlassCard>
    );
  }

  // Not connected
  if (!connectionStatus.isConnected) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Google Business Profile</h3>
            <p className="mt-1 text-sm text-white/70">
              Connectez votre compte Google Business pour récupérer et gérer vos avis
              automatiquement
            </p>
          </div>
          <GlassButton onClick={handleConnect} className="ml-4">
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            Connecter Google Business
          </GlassButton>
        </div>
      </GlassCard>
    );
  }

  // Connected but need to select location
  if (!connectionStatus.token?.locationId && !isSelecting) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <h3 className="text-lg font-semibold text-white">Compte Google Business connecté</h3>
            </div>
            <p className="mt-1 text-sm text-white/70">Sélectionnez votre commerce pour commencer</p>
          </div>
          <div className="flex gap-2">
            <GlassButton variant="secondary" onClick={() => setIsSelecting(true)}>
              Sélectionner un commerce
            </GlassButton>
            <GlassButton variant="secondary" onClick={handleDisconnect}>
              Déconnecter
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Selecting location
  if (isSelecting && locations) {
    return (
      <GlassCard className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Sélectionnez votre commerce Google Business
        </h3>

        <div className="space-y-2">
          {locations.locations.map((location) => (
            <label
              key={location.locationId}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <input
                type="radio"
                name="location"
                value={location.locationId}
                checked={selectedLocationId === location.locationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="h-4 w-4 text-violet-600"
              />
              <div className="flex-1">
                <p className="font-medium text-white">{location.displayName}</p>
                {location.address && <p className="text-sm text-white/60">{location.address}</p>}
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <GlassButton variant="secondary" onClick={() => setIsSelecting(false)}>
            Annuler
          </GlassButton>
          <GlassButton
            onClick={handleSelectLocation}
            disabled={!selectedLocationId || selectLocationMutation.isPending}
          >
            {selectLocationMutation.isPending ? 'Enregistrement...' : 'Valider'}
          </GlassButton>
        </div>
      </GlassCard>
    );
  }

  // Connected with location selected
  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
            <h3 className="text-lg font-semibold text-white">Google Business Profile connecté</h3>
          </div>
          <p className="mt-1 text-sm text-white/70">
            Commerce : <span className="font-medium">{connectionStatus.token?.locationName}</span>
          </p>
          <p className="mt-1 text-xs text-white/50">
            Connecté le{' '}
            {connectionStatus.token?.createdAt
              ? new Date(connectionStatus.token.createdAt).toLocaleDateString('fr-FR')
              : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <GlassButton variant="secondary" onClick={() => setIsSelecting(true)}>
            Changer de commerce
          </GlassButton>
          <GlassButton variant="secondary" onClick={handleDisconnect}>
            Déconnecter
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
}
