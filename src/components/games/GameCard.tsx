/**
 * Game Card Component
 * Displays a custom game or design card with actions
 */

import { Edit, Trash2, Target, Grid3x3, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface GameCardProps {
  id: string;
  name: string;
  type: 'WHEEL' | 'SLOT_MACHINE' | 'WHEEL_MINI';
  description: string;
  badgeText: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
  buttonColor: string;
  buttonHoverColor: string;
  textColor: string;
  borderTopColor: string;
  onEdit: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

const iconMap: Record<'WHEEL' | 'SLOT_MACHINE' | 'WHEEL_MINI', LucideIcon> = {
  WHEEL: Target,
  SLOT_MACHINE: Grid3x3,
  WHEEL_MINI: Trophy,
};

export function GameCard({
  id,
  name,
  type,
  description,
  badgeText,
  borderColor,
  gradientFrom,
  gradientTo,
  buttonColor,
  buttonHoverColor,
  textColor,
  borderTopColor,
  onEdit,
  onDelete,
}: GameCardProps) {
  const Icon = iconMap[type];

  return (
    <button
      onClick={() => onEdit(id)}
      className={`relative group p-6 rounded-2xl border-2 ${borderColor} bg-linear-to-br ${gradientFrom} ${gradientTo} hover:border-opacity-100 hover:shadow-xl hover:scale-105 cursor-pointer transition-all duration-300`}
    >
      {/* Badge */}
      <div
        className={`absolute -top-3 -right-3 bg-linear-to-r ${gradientFrom.replace('from-', 'from-').replace('/10', '')} ${gradientTo.replace('to-', 'to-').replace('/10', '')} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}
      >
        {badgeText}
      </div>

      {/* Icon */}
      <div
        className={`w-16 h-16 rounded-xl bg-linear-to-br ${gradientFrom.replace('/10', '')} ${gradientTo.replace('/10', '')} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">{name}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      {/* CTA */}
      <div className={`mt-6 pt-4 border-t ${borderTopColor} flex gap-2`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(id);
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 ${buttonColor} ${buttonHoverColor} ${textColor} rounded-lg transition-colors`}
        >
          <Edit className="w-4 h-4" />
          Modifier
        </button>
        <button
          onClick={(e) => onDelete(e, id)}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </button>
  );
}
