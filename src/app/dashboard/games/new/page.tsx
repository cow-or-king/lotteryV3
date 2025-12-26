/**
 * New Game Page
 * Page de création d'un nouveau jeu
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import GameConfigForm from '@/components/games/GameConfigForm';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import type { GameType } from '@/lib/types/game.types';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewGamePage() {
  const router = useRouter();
  const { toast } = useToast();

  // Extract mutation options to avoid type instantiation depth issues
  type MutationOptions = {
    onSuccess: (game: { id: string }) => void;
    onError: (error: { message: string }) => void;
  };

  const createGameOptions: MutationOptions = {
    onSuccess: (game) => {
      toast({
        title: 'Jeu créé',
        description: 'Votre jeu a été créé avec succès',
      });
      router.push(`/dashboard/games/${game.id}/edit`);
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error',
      });
    },
  };

  const createMutation = api.game.create.useMutation(createGameOptions);

  const handleSubmit = (values: {
    name: string;
    type: GameType;
    config: Record<string, unknown>;
    primaryColor: string;
    secondaryColor: string;
    vibrationEnabled: boolean;
  }) => {
    createMutation.mutate(values);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Créer un nouveau jeu</h1>
        <p className="text-gray-600">
          Configurez votre jeu interactif avec animations et vibrations
        </p>
      </div>

      {/* Form */}
      <GameConfigForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
