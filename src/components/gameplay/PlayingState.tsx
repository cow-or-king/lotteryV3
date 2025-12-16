/**
 * Composant pour l'état PLAYING du gameplay
 */

import WheelGame from '@/components/games/WheelGame';
import SlotMachineGame from '@/components/games/SlotMachineGame';
import { Gift } from 'lucide-react';
import type { WheelGameConfig, SlotMachineGameConfig } from '@/lib/types/game.types';

interface GameConfig {
  type: string;
  config: unknown;
}

interface Campaign {
  game?: GameConfig | null;
}

interface GameResult {
  winningSegmentId: string | null;
  winningCombination?: [string, string, string] | null;
}

interface PlayingStateProps {
  campaign: Campaign;
  result: GameResult | null;
  onSpinComplete: () => void;
}

export function PlayingState({ campaign, result, onSpinComplete }: PlayingStateProps) {
  if (!campaign.game?.config) {
    return null;
  }

  const gameType = campaign.game.type;

  if (gameType === 'WHEEL_MINI' || gameType === 'WHEEL') {
    return (
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-8">Tournez la roue !</h2>
        <WheelGame
          config={campaign.game.config as unknown as WheelGameConfig}
          primaryColor="#7C3AED"
          secondaryColor="#EC4899"
          onSpinComplete={onSpinComplete}
          forcedSegmentId={result?.winningSegmentId || null}
        />
      </div>
    );
  }

  if (gameType === 'SLOT_MACHINE') {
    return (
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-8">Lancez la machine !</h2>
        <SlotMachineGame
          config={campaign.game.config as unknown as SlotMachineGameConfig}
          primaryColor="#FBBF24"
          secondaryColor="#DC2626"
          onSpinComplete={onSpinComplete}
          forcedCombination={(result?.winningCombination as [string, string, string]) || null}
        />
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 mb-6">
        <Gift className="h-16 w-16 text-gray-400" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Jeu de type {gameType}</h2>
      <p className="text-gray-600 text-lg">Ce type de jeu n'est pas encore implémenté.</p>
      <p className="text-sm text-gray-500 mt-4">
        Seules les roues et machines à sous sont actuellement supportées.
      </p>
    </div>
  );
}
