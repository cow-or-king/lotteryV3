/**
 * Admin AI Configuration Router
 * Gestion des configurations IA (OpenAI, Anthropic)
 * IMPORTANT: ZERO any types, Architecture Hexagonale
 */

import { createTRPCRouter } from '../../trpc';
import { aiConfigSettingsRouter } from './ai-config-settings.router';
import { aiConfigUsageRouter } from './ai-config-usage.router';

/**
 * Main router combinant settings et usage
 */
export const adminAIConfigRouter = createTRPCRouter({
  // Settings procedures (CRUD, test, activate/deactivate)
  listAiConfigs: aiConfigSettingsRouter.listAiConfigs,
  getAiConfigById: aiConfigSettingsRouter.getAiConfigById,
  createAiConfig: aiConfigSettingsRouter.createAiConfig,
  updateAiConfig: aiConfigSettingsRouter.updateAiConfig,
  activateAiConfig: aiConfigSettingsRouter.activateAiConfig,
  deactivateAiConfig: aiConfigSettingsRouter.deactivateAiConfig,
  deleteAiConfig: aiConfigSettingsRouter.deleteAiConfig,
  testAiConnection: aiConfigSettingsRouter.testAiConnection,

  // Usage procedures (statistics)
  getAiUsageStats: aiConfigUsageRouter.getAiUsageStats,
});
