/**
 * Game play screen component - displays the game (wheel or slot)
 */
import WheelGame from '@/components/games/WheelGame';
import SlotMachineGame from '@/components/games/SlotMachineGame';
import type { WheelGameConfig, SlotMachineGameConfig } from '@/lib/types/game.types';
import { Gift } from 'lucide-react';

interface GamePlayStepProps {
  gameType: string | undefined;
  gameConfig: unknown;
  gameResult: {
    winningSegmentId?: string | null;
    winningCombination?: [string, string, string] | null;
  } | null;
  onSpinComplete: () => void;
}

export function GamePlayStep({
  gameType,
  gameConfig,
  gameResult,
  onSpinComplete,
}: GamePlayStepProps) {
  return (
    <div className="text-center">
      {(gameType === 'WHEEL' || gameType === 'WHEEL_MINI') && gameConfig ? (
        <>
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Tournez la roue !</h2>
          <WheelGame
            config={gameConfig as unknown as WheelGameConfig}
            primaryColor="#7C3AED"
            secondaryColor="#EC4899"
            onSpinComplete={onSpinComplete}
            forcedSegmentId={gameResult?.winningSegmentId || null}
          />
        </>
      ) : gameType === 'SLOT_MACHINE' && gameConfig ? (
        <>
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Lancez la machine !</h2>
          <SlotMachineGame
            config={gameConfig as unknown as SlotMachineGameConfig}
            primaryColor="#FBBF24"
            secondaryColor="#DC2626"
            onSpinComplete={onSpinComplete}
            forcedCombination={(gameResult?.winningCombination as [string, string, string]) || null}
          />
        </>
      ) : (
        <div className="py-12">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 mb-6">
            <Gift className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Jeu non configuré</h2>
          <p className="text-gray-600 text-lg">Cette campagne n'a pas de jeu configuré.</p>
        </div>
      )}
    </div>
  );
}
