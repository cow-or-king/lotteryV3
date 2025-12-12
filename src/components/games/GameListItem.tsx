/**
 * Game List Item Component
 * Carte d'affichage d'un jeu dans la liste
 */

'use client';

import { MoreVertical, Play, Edit2, Trash2, BarChart3 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface GameData {
  id: string;
  name: string;
  type: string;
  primaryColor: string;
  secondaryColor: string;
  active: boolean;
  createdAt: Date;
  playsCount?: number;
}

interface GameListItemProps {
  game: GameData;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStats: () => void;
}

const GAME_TYPE_LABELS = {
  WHEEL: '🎡 Roue',
  SCRATCH: '🎫 Grattage',
  SLOT_MACHINE: '🎰 Machine à sous',
  MEMORY: '🧠 Mémoire',
  SHAKE: '📱 Secoue',
  DICE: '🎲 Dés',
  MYSTERY_BOX: '📦 Boîte mystère',
} as const;

export default function GameListItem({
  game,
  onPlay,
  onEdit,
  onDelete,
  onStats,
}: GameListItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [menuOpen]);

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
      {/* Header avec gradient */}
      <div
        className="h-32 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${game.primaryColor} 0%, ${game.secondaryColor} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>

          {/* Menu dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => {
                  onEdit();
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left text-gray-700"
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-medium">Modifier</span>
              </button>
              <button
                onClick={() => {
                  onStats();
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left text-gray-700"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">Statistiques</span>
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Supprimer</span>
              </button>
            </div>
          )}
        </div>

        {/* Type du jeu */}
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
            {GAME_TYPE_LABELS[game.type as keyof typeof GAME_TYPE_LABELS] || game.type}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Nom du jeu */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{game.name}</h3>

        {/* Statistiques */}
        <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Play className="w-4 h-4" />
            <span>{game.playsCount || 0} parties</span>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              game.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {game.active ? 'Actif' : 'Inactif'}
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={onPlay}
          className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${game.primaryColor} 0%, ${game.secondaryColor} 100%)`,
          }}
        >
          Jouer maintenant
        </button>
      </div>
    </div>
  );
}
