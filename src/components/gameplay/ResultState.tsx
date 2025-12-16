/**
 * Composant pour l'état RESULT du gameplay
 */

import { Gift, PartyPopper } from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  description: string | null;
  value: number | null;
  color: string;
}

interface GameResult {
  hasWon: boolean;
  prize: Prize | null;
  claimCode: string | null;
}

interface ResultStateProps {
  result: GameResult;
}

export function ResultState({ result }: ResultStateProps) {
  if (result.hasWon && result.prize) {
    return (
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 animate-bounce"
          style={{ backgroundColor: result.prize.color }}
        >
          <PartyPopper className="h-16 w-16 text-white" />
        </div>
        <h2 className="text-5xl font-bold text-green-600 mb-4">FÉLICITATIONS !</h2>
        <p className="text-2xl text-gray-900 mb-6">Vous avez gagné :</p>
        <div className="bg-gray-50 rounded-2xl p-8 mb-8 border-4 border-green-500">
          <h3 className="text-3xl font-bold mb-2" style={{ color: result.prize.color }}>
            {result.prize.name}
          </h3>
          {result.prize.description && (
            <p className="text-gray-600 mb-4">{result.prize.description}</p>
          )}
          {result.prize.value && (
            <p className="text-2xl font-bold text-purple-600">Valeur: {result.prize.value}€</p>
          )}
        </div>
        {result.claimCode && (
          <div className="bg-purple-50 rounded-xl p-6 mb-6 border-2 border-purple-300">
            <p className="text-sm text-gray-600 mb-2">Votre code de réclamation :</p>
            <p className="text-3xl font-mono font-bold text-purple-700 tracking-wider">
              {result.claimCode}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Notez bien ce code, il vous sera demandé en magasin
            </p>
          </div>
        )}
        <p className="text-gray-600 text-lg">
          Présentez-vous en magasin pour récupérer votre lot !
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-300 mb-6">
        <Gift className="h-16 w-16 text-gray-600" />
      </div>
      <h2 className="text-4xl font-bold text-gray-700 mb-4">Pas de chance cette fois...</h2>
      <p className="text-gray-600 text-lg mb-8">Merci d'avoir participé !</p>
      <p className="text-gray-500 text-sm">
        Revenez nous voir en magasin pour une prochaine opportunité
      </p>
    </div>
  );
}
