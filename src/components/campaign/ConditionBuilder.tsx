/**
 * Condition Builder Component
 * Permet de créer et gérer l'ordre des conditions d'une campagne
 * IMPORTANT: ZERO any types
 */

'use client';

import { CONDITION_TYPE_METADATA } from '@/types/condition.types';
import type { ConditionType } from '@/generated/prisma';
import { useState } from 'react';

interface ConditionItem {
  id: string;
  type: ConditionType;
  title: string;
  description: string;
  iconEmoji: string;
  config: Record<string, string | number | boolean> | null;
  enablesGame?: boolean; // Donne accès au jeu (par défaut true)
}

interface ConditionBuilderProps {
  conditions: ConditionItem[];
  onChange: (conditions: ConditionItem[]) => void;
  googleReviewUrl?: string;
}

export function ConditionBuilder({ conditions, onChange, googleReviewUrl }: ConditionBuilderProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Générer un ID unique
  const generateId = () => `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Ajouter une condition
  const handleAddCondition = (type: ConditionType) => {
    const metadata = CONDITION_TYPE_METADATA[type];

    // Configuration par défaut selon le type de condition
    let config: Record<string, string | number | boolean> | null = null;

    // Pour Google Review, inclure l'URL si disponible
    if (type === 'GOOGLE_REVIEW' && googleReviewUrl) {
      config = {
        googleReviewUrl,
        waitTimeSeconds: 20,
      };
    }

    const newCondition: ConditionItem = {
      id: generateId(),
      type,
      title: metadata.label,
      description: metadata.description,
      iconEmoji: metadata.defaultIcon,
      config,
      enablesGame: true, // Par défaut, les conditions donnent accès au jeu
    };
    onChange([...conditions, newCondition]);
    setShowAddMenu(false);
  };

  // Supprimer une condition
  const handleRemoveCondition = (id: string) => {
    onChange(conditions.filter((c) => c.id !== id));
  };

  // Déplacer une condition vers le haut
  const handleMoveUp = (index: number) => {
    if (index === 0) {
      return;
    }
    const newConditions = [...conditions];
    const temp = newConditions[index];
    const prev = newConditions[index - 1];
    if (!temp || !prev) {
      return;
    }
    newConditions[index] = prev;
    newConditions[index - 1] = temp;
    onChange(newConditions);
  };

  // Déplacer une condition vers le bas
  const handleMoveDown = (index: number) => {
    if (index === conditions.length - 1) {
      return;
    }
    const newConditions = [...conditions];
    const temp = newConditions[index];
    const next = newConditions[index + 1];
    if (!temp || !next) {
      return;
    }
    newConditions[index] = next;
    newConditions[index + 1] = temp;
    onChange(newConditions);
  };

  // Liste des types disponibles (excluant ceux déjà ajoutés)
  const availableTypes = Object.keys(CONDITION_TYPE_METADATA).filter(
    (type) => !conditions.some((c) => c.type === type),
  ) as ConditionType[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Conditions de participation</h3>
          <p className="text-sm text-gray-600">
            Définissez les actions que les participants doivent accomplir
          </p>
        </div>
      </div>

      {/* Liste des conditions */}
      <div className="space-y-3">
        {conditions.map((condition, index) => {
          const metadata = CONDITION_TYPE_METADATA[condition.type];
          const canDelete = condition.type !== 'GOOGLE_REVIEW'; // Google Avis ne peut pas être supprimé

          return (
            <div
              key={condition.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Numéro d'ordre */}
                <div className="flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                    style={{ backgroundColor: metadata.color }}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{condition.iconEmoji}</span>
                    <h4 className="font-semibold text-gray-900">{condition.title}</h4>
                    {condition.type === 'GOOGLE_REVIEW' && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Obligatoire
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{condition.description}</p>

                  {/* Checkbox: Donne accès au jeu */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={condition.enablesGame !== false} // Par défaut true si non défini
                      onChange={(e) => {
                        const updatedConditions = conditions.map((c) =>
                          c.id === condition.id ? { ...c, enablesGame: e.target.checked } : c,
                        );
                        onChange(updatedConditions);
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-600">🎮 Donne accès au jeu</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {/* Monter */}
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Monter"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>

                  {/* Descendre */}
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === conditions.length - 1}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Descendre"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Supprimer */}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(condition.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bouton Ajouter */}
      {availableTypes.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="font-medium">Ajouter une condition</span>
          </button>

          {/* Menu déroulant */}
          {showAddMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-80 overflow-y-auto">
              {availableTypes.map((type) => {
                const metadata = CONDITION_TYPE_METADATA[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleAddCondition(type)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all text-left border-b border-gray-100 last:border-b-0"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${metadata.color}20` }}
                    >
                      <span className="text-xl">{metadata.defaultIcon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{metadata.label}</div>
                      <div className="text-sm text-gray-600 truncate">{metadata.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Comment ça fonctionne ?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Les participants accomplissent les conditions dans l'ordre défini</li>
              <li>Chaque scan de QR code débloque la condition suivante</li>
              <li>Le premier avis Google est obligatoire et ne peut pas être supprimé</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
