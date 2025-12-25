/**
 * Result screen component - displays the prize won
 */
import { Gift } from 'lucide-react';

interface ResultStepProps {
  prize: {
    name: string;
    description: string | null;
    value: number | null;
  };
}

export function ResultStep({ prize }: ResultStepProps) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center mb-6 animate-bounce">
        <div className="w-24 h-24 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
          <Gift className="w-12 h-12 text-white" />
        </div>
      </div>
      <h2 className="text-4xl font-bold text-gray-800 mb-4">🎉 Félicitations !</h2>
      <div className="bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6 mb-6">
        <p className="text-lg font-medium mb-2">Vous avez gagné</p>
        <h3 className="text-3xl font-bold mb-2">{prize.name}</h3>
        {prize.description && <p className="text-white/90">{prize.description}</p>}
        {prize.value && <p className="text-2xl font-bold mt-4">{prize.value}€</p>}
      </div>
      <p className="text-gray-600 mb-4">
        Montrez cet écran au commerçant pour récupérer votre prize !
      </p>
    </div>
  );
}
