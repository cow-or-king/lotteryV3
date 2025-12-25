'use client';

import {
  Coffee,
  CircleDollarSign,
  Utensils,
  ShoppingBag,
  Percent,
  Gift,
  Star,
  Heart,
  Sparkles,
  TrendingUp,
  Award,
  Edit2,
  Trash2,
} from 'lucide-react';

const availableIcons = [
  { name: 'Coffee', icon: Coffee },
  { name: 'Utensils', icon: Utensils },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Percent', icon: Percent },
  { name: 'Gift', icon: Gift },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'Award', icon: Award },
  { name: 'CircleDollarSign', icon: CircleDollarSign },
];

interface PrizeTemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    color: string;
    iconUrl: string | null;
    brandId: string | null;
  };
  brandLogo?: string;
  brandName?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function PrizeTemplateCard({
  template,
  brandLogo,
  brandName,
  onEdit,
  onDelete,
}: PrizeTemplateCardProps) {
  return (
    <div className="group bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 hover:bg-white/60 hover:border-purple-600/30 transition-all duration-300 hover:scale-[1.02]">
      {/* Header avec logo, titre et icône */}
      <div className="flex items-center gap-3 mb-4">
        {/* Brand indicator left */}
        <div className="shrink-0">
          {template.brandId === null ? (
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-base border-2 border-white shadow-md">
              C
            </div>
          ) : brandLogo ? (
            <img
              src={brandLogo}
              alt={brandName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-purple-100 border-2 border-white shadow-md"></div>
          )}
        </div>

        {/* Title and description */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors truncate">
            {template.name}
          </h3>
          {template.description && (
            <p className="text-sm text-gray-600 truncate">{template.description}</p>
          )}
        </div>

        {/* Icon right */}
        <div className="shrink-0">
          {template.iconUrl ? (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: template.color, opacity: 0.9 }}
            >
              {(() => {
                const iconConfig = availableIcons.find((i) => i.name === template.iconUrl);
                if (iconConfig) {
                  const IconComponent = iconConfig.icon;
                  return <IconComponent className="w-6 h-6 text-white" />;
                }
                return null;
              })()}
            </div>
          ) : (
            <div
              className="w-12 h-12 rounded-full"
              style={{ backgroundColor: template.color, opacity: 0.2 }}
            ></div>
          )}
        </div>
      </div>

      {/* Price display */}
      <div className="text-2xl font-bold text-purple-600 mb-4 min-h-10">
        {(template.minPrice !== null || template.maxPrice !== null) && (
          <>
            {template.minPrice !== null && template.maxPrice !== null
              ? `entre ${template.minPrice.toFixed(2)}€ et ${template.maxPrice.toFixed(2)}€`
              : template.minPrice !== null
                ? `${template.minPrice.toFixed(2)}€`
                : template.maxPrice !== null
                  ? `${template.maxPrice.toFixed(2)}€`
                  : ''}
          </>
        )}
      </div>

      {/* Actions */}
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
