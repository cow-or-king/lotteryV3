/**
 * Game Template Grid Component
 * Displays available game templates with their features
 */

import type { GameType } from '@/lib/types/game.types';
import { Sparkles, Dices, Grid3x3, Box, Shuffle, Target, Trophy, Zap } from 'lucide-react';

interface GameTemplate {
  type: GameType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  features: string[];
  popular?: boolean;
  comingSoon?: boolean;
}

interface GameTemplateGridProps {
  templates: GameTemplate[];
  onSelectTemplate: (template: GameTemplate) => void;
}

export const gameTemplates: GameTemplate[] = [
  {
    type: 'WHEEL',
    name: 'Roue de la Fortune',
    description: 'Roue interactive avec segments personnalisables et animations fluides',
    icon: Target,
    color: 'from-purple-500 to-pink-500',
    gradient: 'bg-linear-to-br from-purple-50 to-pink-50',
    features: ['Segments personnalisables', 'Animations fluides', 'Son & vibrations'],
    popular: true,
  },
  {
    type: 'SCRATCH',
    name: 'Carte à Gratter',
    description: 'Grattez pour découvrir votre gain avec effet réaliste',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-linear-to-br from-blue-50 to-cyan-50',
    features: [
      'Effet de grattage réaliste',
      'Zone de grattage personnalisable',
      'Révélation progressive',
    ],
  },
  {
    type: 'SLOT_MACHINE',
    name: 'Machine à Sous',
    description: 'Alignez les symboles pour gagner des récompenses',
    icon: Grid3x3,
    color: 'from-orange-500 to-red-500',
    gradient: 'bg-linear-to-br from-orange-50 to-red-50',
    features: ['Rouleaux animés', 'Symboles personnalisés', 'Combinaisons gagnantes'],
    popular: true,
  },
  {
    type: 'MYSTERY_BOX',
    name: 'Boîte Mystère',
    description: 'Choisissez une boîte parmi plusieurs pour découvrir votre surprise',
    icon: Box,
    color: 'from-green-500 to-emerald-500',
    gradient: 'bg-linear-to-br from-green-50 to-emerald-50',
    features: ['Choix multiple', "Animation d'ouverture", 'Suspense garanti'],
  },
  {
    type: 'DICE',
    name: 'Lancer de Dés',
    description: 'Lancez les dés et tentez votre chance',
    icon: Dices,
    color: 'from-yellow-500 to-amber-500',
    gradient: 'bg-linear-to-br from-yellow-50 to-amber-50',
    features: ['Physique réaliste', 'Multiple dés', 'Règles personnalisables'],
  },
  {
    type: 'SHAKE',
    name: 'Secouer pour Gagner',
    description: 'Secouez votre téléphone pour révéler votre gain',
    icon: Zap,
    color: 'from-indigo-500 to-purple-500',
    gradient: 'bg-linear-to-br from-indigo-50 to-purple-50',
    features: ['Détection de mouvement', 'Feedback haptique', 'Mobile-first'],
    comingSoon: true,
  },
  {
    type: 'MEMORY',
    name: 'Jeu de Mémoire',
    description: 'Trouvez les paires pour gagner des récompenses',
    icon: Shuffle,
    color: 'from-rose-500 to-pink-500',
    gradient: 'bg-linear-to-br from-rose-50 to-pink-50',
    features: ['Cartes personnalisables', 'Niveaux de difficulté', 'Chronomètre'],
    comingSoon: true,
  },
  {
    type: 'WHEEL_MINI',
    name: 'Roue Rapide',
    description: 'Version simplifiée et ultra-rapide de la roue',
    icon: Trophy,
    color: 'from-teal-500 to-cyan-500',
    gradient: 'bg-linear-to-br from-teal-50 to-cyan-50',
    features: ['Rotation rapide', 'Interface minimaliste', 'Parfait pour mobile'],
  },
];

export function GameTemplateGrid({ templates, onSelectTemplate }: GameTemplateGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {templates.map((template) => {
        const Icon = template.icon;
        return (
          <button
            key={template.type}
            onClick={() => onSelectTemplate(template)}
            disabled={template.comingSoon}
            className={`
              relative group
              p-6 rounded-2xl border-2 border-gray-200
              transition-all duration-300
              ${template.gradient}
              ${
                template.comingSoon
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:border-gray-300 hover:shadow-xl hover:scale-105 cursor-pointer'
              }
            `}
          >
            {/* Popular Badge */}
            {template.popular && !template.comingSoon && (
              <div className="absolute -top-3 -right-3 bg-linear-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                Populaire
              </div>
            )}

            {/* Coming Soon Badge */}
            {template.comingSoon && (
              <div className="absolute -top-3 -right-3 bg-linear-to-r from-gray-400 to-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                Bientôt
              </div>
            )}

            {/* Icon */}
            <div
              className={`
                w-16 h-16 rounded-xl bg-linear-to-br ${template.color}
                flex items-center justify-center mb-4
                group-hover:scale-110 transition-transform duration-300
              `}
            >
              <Icon className="w-8 h-8 text-white" />
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>

            {/* Features */}
            <ul className="space-y-2">
              {template.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                  <div className={`w-1.5 h-1.5 rounded-full bg-linear-to-r ${template.color}`} />
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA */}
            {!template.comingSoon && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <span
                  className={`text-sm font-semibold bg-linear-to-r ${template.color} bg-clip-text text-transparent`}
                >
                  Personnaliser →
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
