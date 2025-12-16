/**
 * Template Selection Modal
 * Modal pour sélectionner un template de jeu
 * IMPORTANT: ZERO any types
 */

'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { GameType } from '@/lib/types/game.types';
import { getTemplatesForGameType } from '@/lib/game-templates/default-configs';
import { Check, Sparkles, Zap, Layout } from 'lucide-react';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: GameType;
  gameName: string;
  onSelectTemplate: (templateKey: string) => void;
}

export function TemplateSelectionModal({
  isOpen,
  onClose,
  gameType,
  gameName,
  onSelectTemplate,
}: TemplateSelectionModalProps) {
  const templates = getTemplatesForGameType(gameType);
  const templateEntries = Object.entries(templates);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(templateEntries[0]?.[0] || '');

  const handleConfirm = () => {
    onSelectTemplate(selectedTemplate);
    onClose();
  };

  const getTemplateIcon = (key: string) => {
    switch (key) {
      case 'classic':
        return Layout;
      case 'premium':
        return Sparkles;
      case 'simple':
        return Zap;
      default:
        return Layout;
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Choisissez votre template</h2>
          <p className="text-gray-600">Sélectionnez un style de départ pour {gameName}</p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {templateEntries.map(([key, template]) => {
            const Icon = getTemplateIcon(key);
            const isSelected = selectedTemplate === key;

            if (!template || typeof template !== 'object' || !('name' in template)) {
              return null;
            }

            return (
              <button
                key={key}
                onClick={() => setSelectedTemplate(key)}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-200
                  ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`
                  w-12 h-12 rounded-lg mb-4 flex items-center justify-center
                  ${isSelected ? 'bg-purple-500' : 'bg-gray-200'}
                `}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                </div>

                {/* Content */}
                <h3
                  className={`text-lg font-bold mb-2 ${
                    isSelected ? 'text-purple-700' : 'text-gray-800'
                  }`}
                >
                  {(template as { name: string; description: string }).name}
                </h3>
                <p className="text-sm text-gray-600 text-left">
                  {(template as { name: string; description: string }).description}
                </p>

                {/* Preview Colors (for Wheel) */}
                {gameType === 'WHEEL' &&
                  'config' in template &&
                  typeof template.config === 'object' &&
                  template.config !== null && (
                    <div className="flex gap-2 mt-4">
                      <div
                        className="w-8 h-8 rounded-lg border border-gray-200"
                        style={{
                          backgroundColor: (template.config as { primaryColor: string })
                            .primaryColor,
                        }}
                      />
                      <div
                        className="w-8 h-8 rounded-lg border border-gray-200"
                        style={{
                          backgroundColor: (template.config as { secondaryColor: string })
                            .secondaryColor,
                        }}
                      />
                      <div
                        className="w-8 h-8 rounded-lg border border-gray-200"
                        style={{
                          backgroundColor: (template.config as { backgroundColor: string })
                            .backgroundColor,
                        }}
                      />
                    </div>
                  )}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTemplate}
            className="px-6 py-2.5 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuer avec ce template
          </button>
        </div>
      </div>
    </Dialog>
  );
}
