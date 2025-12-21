/**
 * Composant Header pour le gameplay
 */

interface MockUser {
  name: string;
  email: string;
}

interface Campaign {
  name: string;
}

interface GamePlayHeaderProps {
  campaign: Campaign;
  mockUser: MockUser | null;
}

export function GamePlayHeader({ campaign, mockUser }: GamePlayHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <div className="inline-block bg-white/70 backdrop-blur-xl border border-white/30 px-6 py-3 rounded-full text-sm font-semibold text-gray-700 shadow-lg mb-4">
        Étape 2 sur 2
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">{campaign.name}</h1>
      {mockUser && (
        <p className="text-lg text-gray-700">
          Bienvenue,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">
            {mockUser.name}
          </span>
        </p>
      )}
    </div>
  );
}
