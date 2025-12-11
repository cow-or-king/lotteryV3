/**
 * QR Code Router
 * Router principal qui compose tous les endpoints de QR codes
 * IMPORTANT: ZERO any types
 */

import { createTRPCRouter } from '../trpc';
import { qrCodeQueriesRouter } from './qr-code/qr-code.queries';
import { qrCodeMutationsRouter } from './qr-code/qr-code.mutations';
import { qrCodeStorageRouter } from './qr-code/qr-code.storage';

/**
 * Router principal pour les QR codes
 * Merge des sous-routers pour garder la même API publique
 */
export const qrCodeRouter = createTRPCRouter({
  // Queries (lecture seule)
  list: qrCodeQueriesRouter.list,
  getById: qrCodeQueriesRouter.getById,
  getStats: qrCodeQueriesRouter.getStats,
  scan: qrCodeQueriesRouter.scan,

  // Mutations CRUD
  create: qrCodeMutationsRouter.create,
  createBatch: qrCodeMutationsRouter.createBatch,
  update: qrCodeMutationsRouter.update,
  delete: qrCodeMutationsRouter.delete,

  // Storage (Supabase)
  uploadLogo: qrCodeStorageRouter.uploadLogo,
  deleteLogo: qrCodeStorageRouter.deleteLogo,
});
