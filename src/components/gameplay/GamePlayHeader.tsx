/**
 * Composant Header pour le gameplay
 */

import { Trophy } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto mb-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            {mockUser && <p className="text-sm text-purple-100 mt-1">Bienvenue, {mockUser.name}</p>}
          </div>
          <Trophy className="h-12 w-12 text-yellow-300" />
        </div>
      </div>
    </div>
  );
}
