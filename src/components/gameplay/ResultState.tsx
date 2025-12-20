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
      <div className="text-center py-8">
        <div className="inline-block bg-white/70 backdrop-blur-xl border border-white/30 px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 font-bold">
            ✓ Participation validée
          </span>
        </div>

        <h1 className="text-5xl font-bold text-gray-800 mb-2">
          Vous avez{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            gagné
          </span>
        </h1>
        <p className="text-xl text-gray-700 mb-8">Félicitations ! Voici votre récompense</p>

        {/* Prize Info */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden mb-6">
          <div className="p-8 text-center border-b border-white/30">
            <div className="inline-block bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 mb-6 shadow-lg">
              <span className="text-7xl">🎁</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-3">{result.prize.name}</h2>
            {result.prize.description && (
              <p className="text-lg text-gray-700 mb-4">{result.prize.description}</p>
            )}
            {result.prize.value && (
              <div className="inline-block bg-white/70 backdrop-blur-xl border border-white/30 px-5 py-2.5 rounded-full border-purple-200 shadow">
                <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  Valeur: {result.prize.value}€
                </span>
              </div>
            )}
          </div>

          {/* Code Section */}
          {result.claimCode && (
            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-xs uppercase tracking-wide text-gray-700 font-semibold mb-4">
                  Code de réclamation
                </p>
                <div className="bg-white/70 backdrop-blur-xl border-2 border-purple-300 rounded-2xl p-6 mb-6 shadow-lg">
                  <div className="font-mono text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 tracking-wider">
                    {result.claimCode}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-2xl transform hover:scale-105 transition-all shadow-xl">
                  Copier le code
                </button>
                <button className="w-full px-6 py-4 bg-white/70 backdrop-blur-xl border border-white/30 text-gray-800 font-semibold rounded-2xl hover:bg-white/50 transition-all border-purple-200 shadow">
                  Envoyer par email
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Code unique et personnel • Non transférable
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 mb-6">
        <Gift className="h-16 w-16 text-gray-600" />
      </div>
      <h2 className="text-4xl font-bold text-gray-800 mb-4">Pas de chance cette fois...</h2>
      <p className="text-gray-700 text-lg mb-8">Merci d'avoir participé !</p>
      <p className="text-gray-600 text-sm">
        Revenez nous voir en magasin pour une prochaine opportunité
      </p>
    </div>
  );
}
