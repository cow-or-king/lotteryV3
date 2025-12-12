/**
 * QR Code Mutations
 * Toutes les mutations CRUD pour les QR codes
 * IMPORTANT: ZERO any types
 */

import { createTRPCRouter } from '../../trpc';
import { qrCodeCreateRouter } from './mutations/qr-code.create';
import { qrCodeUpdateDeleteRouter } from './mutations/qr-code.update-delete';

export const qrCodeMutationsRouter = createTRPCRouter({
  // Création
  create: qrCodeCreateRouter.create,
  createBatch: qrCodeCreateRouter.createBatch,

  // Mise à jour & Suppression
  update: qrCodeUpdateDeleteRouter.update,
  delete: qrCodeUpdateDeleteRouter.delete,
});
