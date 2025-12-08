/**
 * ResponseEditor Component
 * Éditeur pour répondre aux avis avec sélection de templates
 * IMPORTANT: ZERO any types, Type-safety complète
 */

'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { FileText, Sparkles, X, Check } from 'lucide-react';
import { useRespondToReview } from '@/hooks/use-reviews';
import { useResponseTemplatesByStore, type TemplateCategory } from '@/hooks/use-response-templates';

interface ResponseTemplate {
  readonly templateId: string;
  readonly name: string;
  readonly content: string;
  readonly category: TemplateCategory;
  readonly usageCount: number;
}

interface ResponseEditorProps {
  reviewId: string;
  storeId: string;
  reviewRating: number;
  reviewComment: string | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}

/**
 * Éditeur de réponse aux avis avec templates
 */
export const ResponseEditor = ({
  reviewId,
  storeId,
  reviewRating,
  reviewComment,
  onCancel,
  onSuccess,
}: ResponseEditorProps) => {
  const [responseContent, setResponseContent] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Déterminer la catégorie selon le rating
  const getCategory = (rating: number): TemplateCategory => {
    if (rating >= 4) return 'POSITIVE';
    if (rating === 3) return 'NEUTRAL';
    return 'NEGATIVE';
  };

  const category = getCategory(reviewRating);

  // Hooks
  const { respondToReview, isLoading, isSuccess } = useRespondToReview();
  const { templates, isLoading: templatesLoading } = useResponseTemplatesByStore(
    storeId,
    category,
    false,
  );

  // Réinitialiser quand succès
  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  // Appliquer un template
  const applyTemplate = (template: ResponseTemplate) => {
    setResponseContent(template.content);
    setSelectedTemplateId(template.templateId);
    setShowTemplates(false);
  };

  // Envoyer la réponse
  const handleSubmit = () => {
    if (!responseContent.trim()) return;
    respondToReview(reviewId, responseContent, selectedTemplateId ?? undefined);
  };

  // Compter caractères
  const charCount = responseContent.length;
  const maxChars = 4000; // Limite Google
  const isOverLimit = charCount > maxChars;

  return (
    <GlassCard variant="light" className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Rédiger une réponse</h3>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Avis référencé */}
      {reviewComment && (
        <div className="mb-4 p-4 bg-gray-100/50 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Avis:</p>
          <p className="text-gray-800 line-clamp-3">{reviewComment}</p>
        </div>
      )}

      {/* Sélecteur de templates */}
      <div className="mb-4">
        <GlassButton
          variant="secondary"
          size="sm"
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center gap-2"
          disabled={templatesLoading}
        >
          <Sparkles className="w-4 h-4" />
          {showTemplates ? 'Masquer les templates' : 'Utiliser un template'}
        </GlassButton>

        {showTemplates && (
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {!Array.isArray(templates) || templates.length === 0 ? (
              <p className="text-sm text-gray-600 italic">
                Aucun template disponible pour cette catégorie
              </p>
            ) : (
              templates.map((template: ResponseTemplate) => (
                <button
                  key={template.templateId}
                  onClick={() => applyTemplate(template)}
                  className="w-full text-left p-3 rounded-xl bg-white/50 hover:bg-white/70 border border-gray-200/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{template.name}</span>
                    <GlassBadge variant="info" size="sm">
                      {template.usageCount} fois
                    </GlassBadge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Éditeur de texte */}
      <div className="mb-4">
        <textarea
          value={responseContent}
          onChange={(e) => setResponseContent(e.target.value)}
          placeholder="Écrivez votre réponse ici..."
          className="w-full min-h-[200px] p-4 rounded-xl bg-white/50 border border-gray-200/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none backdrop-blur-xl resize-none transition-all"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-gray-600">
            Rédigez une réponse professionnelle et personnalisée
          </p>
          <p className={`text-sm font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-600'}`}>
            {charCount}/{maxChars}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <GlassButton variant="ghost" size="md" onClick={onCancel} disabled={isLoading}>
            Annuler
          </GlassButton>
        )}
        <GlassButton
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={!responseContent.trim() || isOverLimit || isLoading}
          loading={isLoading}
          className="flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Publier la réponse
        </GlassButton>
      </div>

      {/* Notes importantes */}
      <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-200/30">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Cette réponse sera publiée publiquement sur Google. Assurez-vous
          qu'elle est professionnelle et respectueuse.
        </p>
      </div>
    </GlassCard>
  );
};
