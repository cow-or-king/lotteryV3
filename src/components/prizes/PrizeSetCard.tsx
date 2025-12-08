'use client';

import { Edit2, Trash2 } from 'lucide-react';

interface PrizeSetItem {
  prizeTemplate: { name: string };
  probability: number;
  quantity: number;
}

interface PrizeSetCardProps {
  set: {
    id: string;
    name: string;
    description: string | null;
    items?: PrizeSetItem[];
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function PrizeSetCard({ set, onEdit, onDelete }: PrizeSetCardProps) {
  return (
    <div className="group bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 hover:bg-white/60 hover:border-purple-600/30 transition-all duration-300 hover:scale-[1.02] flex flex-col">
      <div className="mb-4 flex justify-between items-start gap-4">
        <h3 className="text-lg font-bold text-purple-600 group-hover:text-purple-700 transition-colors">
          {set.name}
        </h3>
        {set.description && (
          <p className="text-sm text-gray-600 text-right shrink-0 max-w-[50%]">{set.description}</p>
        )}
      </div>

      <div className="mb-4 h-[84px] overflow-auto">
        {set.items && set.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {set.items.map((item) => (
              <div
                key={item.prizeTemplate.name}
                className="flex items-center text-xs bg-purple-50 px-2 py-1 rounded"
              >
                <span className="font-medium text-gray-700 flex-1 truncate">
                  {item.prizeTemplate.name}
                </span>
                <span className="text-gray-600 shrink-0 flex items-center gap-1">
                  <span className="w-6 text-right">
                    {item.quantity === 0 ? '∞' : item.quantity}
                  </span>
                  <span>•</span>
                  <span className="w-8 text-left">{item.probability}%</span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic text-center">Aucun gain configuré</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-2 bg-purple-100 text-purple-600 rounded-lg font-semibold text-sm hover:bg-purple-200 transition-colors"
        >
          <Edit2 className="w-4 h-4 inline" />
        </button>
        <button
          onClick={onDelete}
          className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors"
        >
          <Trash2 className="w-4 h-4 inline" />
        </button>
      </div>
    </div>
  );
}
