/**
 * Admin Router
 * Router principal qui compose tous les endpoints d'administration
 * IMPORTANT: ZERO any types, Architecture Hexagonale
 */

import { createTRPCRouter } from '../trpc';
import { adminAIConfigRouter } from './admin/admin.ai-config';
import { adminPlatformStatsRouter } from './admin/admin.platform-stats';

/**
 * Router principal pour l'administration
 * Merge des sous-routers pour garder la même API publique
 */
export const adminRouter = createTRPCRouter({
  // AI Configuration endpoints
  listAiConfigs: adminAIConfigRouter.listAiConfigs,
  getAiConfigById: adminAIConfigRouter.getAiConfigById,
  createAiConfig: adminAIConfigRouter.createAiConfig,
  updateAiConfig: adminAIConfigRouter.updateAiConfig,
  activateAiConfig: adminAIConfigRouter.activateAiConfig,
  deactivateAiConfig: adminAIConfigRouter.deactivateAiConfig,
  deleteAiConfig: adminAIConfigRouter.deleteAiConfig,
  testAiConnection: adminAIConfigRouter.testAiConnection,
  getAiUsageStats: adminAIConfigRouter.getAiUsageStats,

  // Platform Statistics endpoints
  getPlatformStats: adminPlatformStatsRouter.getPlatformStats,
  listClients: adminPlatformStatsRouter.listClients,
  getClientDetails: adminPlatformStatsRouter.getClientDetails,
});
