/**
 * QR Codes List Page
 * Page de liste des QR codes
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { QRCodeListItem } from '@/components/qr-codes';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirm } from '@/hooks/ui/useConfirm';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import { downloadQRCode, generateQRCode } from '@/lib/utils/qr-code-generator';
import { transformToQRCodeListItem } from '@/lib/utils/qr-code-transform';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QRCodesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useUtils();

  // Hook de confirmation
  const { ConfirmDialogProps, confirm } = useConfirm();

  // Fetch QR codes avec refetch automatique
  const { data: qrCodes, isLoading } = api.qrCode.list.useQuery(undefined, {
    refetchOnMount: true, // Refetch quand le composant monte
    refetchOnWindowFocus: true, // Refetch quand la fenêtre reprend le focus
  });

  // Delete mutation
  const deleteMutation = api.qrCode.delete.useMutation({
    onSuccess: async () => {
      toast({
        title: 'QR code supprimé',
        description: 'Le QR code a été supprimé avec succès',
      });
      // Invalidate list query to refetch data
      await utils.qrCode.list.invalidate();
    },
    onError: (error: { message: string }) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error',
      });
    },
  });

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Supprimer le QR code',
      message: `Êtes-vous sûr de vouloir supprimer le QR code "${name}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'danger',
    });

    if (confirmed) {
      deleteMutation.mutate({ id });
    }
  };

  type QRCodeItem = NonNullable<typeof qrCodes>[number];
  const handleDownload = async (qrCode: QRCodeItem) => {
    try {
      toast({
        title: 'Génération en cours...',
        description: 'Téléchargement du QR code',
      });

      const result = await generateQRCode({
        url: qrCode.url,
        style: qrCode.style,
        animation: qrCode.animation,
        foregroundColor: qrCode.foregroundColor,
        backgroundColor: qrCode.backgroundColor,
        size: 1024, // Haute résolution pour l'export
        errorCorrectionLevel: qrCode.errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
        logoUrl: qrCode.logoUrl,
        logoSize: qrCode.logoSize || undefined,
      });

      downloadQRCode(result.blob, `${qrCode.name}.png`);

      toast({
        title: 'Téléchargement réussi',
        description: 'Le QR code a été téléchargé',
      });
    } catch (error) {
      console.error('Failed to download QR code:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le QR code',
        variant: 'error',
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes QR Codes</h1>
          <p className="text-gray-600">Gérez vos QR codes personnalisés</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/qr-codes/new')}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Créer un QR Code
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* QR Codes List */}
      {!isLoading && qrCodes && qrCodes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrCodes.map((qrCode) => (
            <QRCodeListItem
              key={qrCode.id}
              qrCode={transformToQRCodeListItem(qrCode)}
              onEdit={() => router.push(`/dashboard/qr-codes/${qrCode.id}/edit`)}
              onDelete={() => handleDelete(qrCode.id, qrCode.name)}
              onDownload={() => handleDownload(qrCode)}
              onStats={() => router.push(`/dashboard/qr-codes/${qrCode.id}/stats`)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && qrCodes && qrCodes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucun QR code</h2>
          <p className="text-gray-600 text-center mb-8 max-w-md">
            Vous n'avez pas encore créé de QR code. Commencez par créer votre premier QR code
            personnalisé avec des styles et animations uniques.
          </p>
          <button
            onClick={() => router.push('/dashboard/qr-codes/new')}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Créer mon premier QR Code
          </button>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog {...ConfirmDialogProps} />
    </div>
  );
}
