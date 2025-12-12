/**
 * Games Dashboard Page
 * Page de gestion des jeux
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import GameListItem from '@/components/games/GameListItem';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirm } from '@/hooks/ui/useConfirm';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GamesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useUtils();

  // Hook de confirmation
  const { ConfirmDialogProps, confirm } = useConfirm();

  // Fetch games avec refetch automatique
  const { data: games, isLoading } = api.game.list.useQuery(undefined, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Delete mutation
  const deleteMutation = api.game.delete.useMutation({
    onSuccess: async () => {
      toast({
        title: 'Jeu supprimé',
        description: 'Le jeu a été supprimé avec succès',
      });
      await utils.game.list.invalidate();
    },
    onError: (error: { message: string }) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error',
      });
    },
  });

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Supprimer le jeu',
      message: `Êtes-vous sûr de vouloir supprimer le jeu "${name}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'danger',
    });

    if (confirmed) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Jeux</h1>
          <p className="text-gray-700">Créez et gérez vos jeux interactifs</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/games/new')}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Créer un jeu
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Games List */}
      {!isLoading && games && games.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(
            (game: {
              id: string;
              name: string;
              type: string;
              primaryColor: string;
              secondaryColor: string;
              active: boolean;
              createdAt: Date;
              _count?: { plays: number };
            }) => (
              <GameListItem
                key={game.id}
                game={{
                  id: game.id,
                  name: game.name,
                  type: game.type,
                  primaryColor: game.primaryColor,
                  secondaryColor: game.secondaryColor,
                  active: game.active,
                  createdAt: game.createdAt,
                  playsCount: game._count?.plays || 0,
                }}
                onPlay={() => router.push(`/play/${game.id}`)}
                onEdit={() => router.push(`/dashboard/games/${game.id}/edit`)}
                onDelete={() => handleDelete(game.id, game.name)}
                onStats={() => router.push(`/dashboard/games/${game.id}/stats`)}
              />
            ),
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && games && games.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucun jeu</h2>
          <p className="text-gray-600 text-center mb-8 max-w-md">
            Vous n'avez pas encore créé de jeu. Commencez par créer votre premier jeu interactif
            avec des animations et du feedback haptique.
          </p>
          <button
            onClick={() => router.push('/dashboard/games/new')}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Créer mon premier jeu
          </button>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog {...ConfirmDialogProps} />
    </div>
  );
}
